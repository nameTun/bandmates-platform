import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TaskType } from '../../common/enums/task-type.enum';
import * as XLSX from 'xlsx';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<any[]> {
    return this.categoriesRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.promptsCount', 'category.prompts')
      .orderBy('category.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Không tìm thấy dạng bài này');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  // Giữ lại để không làm vỡ các module cũ nếu có gọi
  async deactivate(id: string): Promise<void> {
    return this.remove(id);
  }

  /**
   * Import Danh mục từ Excel
   */
  async importFromExcel(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

    const results = { total: 0, created: 0, updated: 0, errors: [] as string[] };

    for (const [index, row] of rawData.entries()) {
      try {
        results.total++;
        const name = row.name || row.Name || row['Tên'];
        const taskType = row.taskType || row.TaskType || row['Loại Task'];
        const description = row.description || row.Description || row['Mô tả'];

        if (!name || !taskType) {
          results.errors.push(`Dòng ${index + 2}: Thiếu tên hoặc loại task`);
          continue;
        }

        // Kiểm tra xem đã tồn tại chưa (theo tên và loại task)
        let category = await this.categoriesRepository.findOne({ 
          where: { name, taskType } 
        });

        if (category) {
          category.description = description || category.description;
          await this.categoriesRepository.save(category);
          results.updated++;
        } else {
          category = this.categoriesRepository.create({
            name,
            taskType: taskType as TaskType,
            description,
          });
          await this.categoriesRepository.save(category);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Dòng ${index + 2}: ${error.message}`);
      }
    }
    return results;
  }

  /**
   * Export Danh mục ra Excel
   */
  async exportToExcel() {
    const categories = await this.findAll();
    const sheetData = categories.map(c => ({
      'Tên': c.name,
      'Loại Task': c.taskType,
      'Mô tả': c.description,
      'Số lượng đề bài': (c as any).promptsCount || 0,
      'Ngày tạo': c.createdAt,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
