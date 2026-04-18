import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { TaskType } from '../../common/enums/task-type.enum';
import * as XLSX from 'xlsx';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicsRepository.create(createTopicDto);
    return this.topicsRepository.save(topic);
  }

  async findAll(): Promise<any[]> {
    return this.topicsRepository
      .createQueryBuilder('topic')
      .loadRelationCountAndMap('topic.promptsCount', 'topic.prompts')
      .orderBy('topic.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({ where: { id } });
    if (!topic) throw new NotFoundException('Không tìm thấy chủ đề này');
    return topic;
  }

  async remove(id: string): Promise<void> {
    await this.topicsRepository.delete(id);
  }

  async update(id: string, updateData: Partial<CreateTopicDto>): Promise<Topic> {
    const topic = await this.findOne(id);
    Object.assign(topic, updateData);
    return this.topicsRepository.save(topic);
  }

  async deactivate(id: string): Promise<void> {
    return this.remove(id);
  }

  /**
   * Import Chủ đề từ Excel
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
        const taskType = row.taskType || row.TaskType || row['Loại Task'] || TaskType.TASK_2;
        const description = row.description || row.Description || row['Mô tả'];

        if (!name) {
          results.errors.push(`Dòng ${index + 2}: Thiếu tên chủ đề`);
          continue;
        }

        let topic = await this.topicsRepository.findOne({ 
          where: { name, taskType: taskType as TaskType } 
        });

        if (topic) {
          topic.description = description || topic.description;
          await this.topicsRepository.save(topic);
          results.updated++;
        } else {
          topic = this.topicsRepository.create({
            name,
            taskType: taskType as TaskType,
            description,
          });
          await this.topicsRepository.save(topic);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Dòng ${index + 2}: ${error.message}`);
      }
    }
    return results;
  }

  /**
   * Export Chủ đề ra Excel
   */
  async exportToExcel() {
    const topics = await this.findAll();
    const sheetData = topics.map(t => ({
      'Tên': t.name,
      'Loại Task': t.taskType,
      'Mô tả': t.description,
      'Số lượng đề bài': (t as any).promptsCount || 0,
      'Ngày tạo': t.createdAt,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Topics');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
