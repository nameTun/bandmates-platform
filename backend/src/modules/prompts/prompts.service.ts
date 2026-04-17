import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { Topic } from '../topics/entities/topic.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { TaskType } from '../../common/enums/task-type.enum';
import * as XLSX from 'xlsx';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) { }

  // --- QUẢN LÝ ĐỀ BÀI (Prompt) ---
  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    const { categoryId, topicId, ...promptData } = createPromptDto;

    // 1. Tìm Category (Bắt buộc)
    const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException('Danh mục không hợp lệ');
    }

    // 2. Tìm Topic (Tuỳ chọn cho Task 1, thường bắt buộc cho Task 2)
    let topic: Topic | undefined = undefined;
    if (topicId) {
      const foundTopic = await this.topicsRepository.findOne({ where: { id: topicId } });
      if (!foundTopic) {
        throw new BadRequestException('Chủ đề không hợp lệ');
      }
      topic = foundTopic;
    }

    // 3. Tạo prompt mới
    const prompt = this.promptsRepository.create({
      ...promptData,
      category,
      topic,
    });

    return this.promptsRepository.save(prompt);
  }

  // Lấy danh sách đề thi (phục vụ Admin Dashboard và Practice Library)
  async findAll(user?: any): Promise<Prompt[]> {
    const whereCondition = user ? {} : { isFreeSample: true };

    return this.promptsRepository.find({
      where: whereCondition,
      relations: ['category', 'topic'],
      order: { createdAt: 'DESC' },
    });
  }

  // Tìm 1 đề bài theo ID
  async findOne(id: string): Promise<Prompt> {
    const prompt = await this.promptsRepository.findOne({
      where: { id },
      relations: ['category', 'topic'],
    });
    if (!prompt) throw new NotFoundException('Không tìm thấy đề bài này');
    return prompt;
  }

  // --- EXCEL IMPORT/EXPORT ---

  /**
   * Import dữ liệu cho Task 2
   * Cấu trúc mong đợi: topic, category, context, targetBand, isFreeSample
   */
  async importPromptsTask2(fileBuffer: Buffer) {
    const data = this.parseExcelSheet(fileBuffer);
    return this.processImport(data, TaskType.TASK_2, ['topic', 'category', 'context']);
  }

  /**
   * Import dữ liệu cho Task 1 Academic
   * Cấu trúc mong đợi: url, category, context, targetBand, isFreeSample
   */
  async importPromptsTask1Academic(fileBuffer: Buffer) {
    const data = this.parseExcelSheet(fileBuffer);
    return this.processImport(data, TaskType.TASK_1_ACADEMIC, ['url', 'category', 'context']);
  }

  /**
   * Import dữ liệu cho Task 1 General
   * Cấu trúc mong đợi: category, context, targetBand, isFreeSample
   */
  async importPromptsTask1General(fileBuffer: Buffer) {
    const data = this.parseExcelSheet(fileBuffer);
    return this.processImport(data, TaskType.TASK_1_GENERAL, ['category', 'context']);
  }

  /**
   * Hàm helper đọc dữ liệu từ file Excel (lấy sheet đầu tiên)
   */
  private parseExcelSheet(fileBuffer: Buffer): any[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  /**
   * Logic xử lý Import chung cho tất cả các loại Task
   */
  private async processImport(data: any[], taskType: TaskType, requiredFields: string[]) {
    const results = { total: 0, created: 0, updated: 0, errors: [] as string[] };

    for (const [index, rawRow] of data.entries()) {
      try {
        results.total++;
        
        // Chuyển tất cả key về chữ thường, xoá dấu cách và SMART MAPPING
        const row: any = {};
        for (const key of Object.keys(rawRow)) {
          const cleanKey = key.toLowerCase().replace(/\s+/g, ''); // Xoá hết dấu cách
          row[cleanKey] = rawRow[key];
          
          // Smart Mapping (Chỉ cần chứa từ khoá là được)
          if (cleanKey.includes('topic') || cleanKey.includes('chủđề')) row.topic = rawRow[key];
          if (cleanKey.includes('category') || cleanKey.includes('dạngbài')) row.category = rawRow[key];
          if (cleanKey.includes('prompt') || cleanKey.includes('question') || cleanKey.includes('đềbài') || cleanKey.includes('nộidung')) {
            row.prompt = rawRow[key];
          }
        }

        // 1. Lấy nội dung đề bài (Đã được map ở trên)
        const content = row.prompt || row.context || row.content || row.question;

        // 2. Validate các trường bắt buộc
        const missingFields = requiredFields.filter(f => {
          const field = f.toLowerCase();
          // Kiểm tra xem đã được map vào các key chuẩn chưa
          if (field === 'context' || field === 'content' || field === 'prompt') return !content;
          if (field === 'topic') return !row.topic;
          if (field === 'category') return !row.category;
          return !row[field];
        });

        if (missingFields.length > 0) {
          results.errors.push(`Dòng ${index + 2}: Thiếu các cột (${missingFields.join(', ')})`);
          continue;
        }

        // 2. Tìm hoặc tạo Category
        let category: Category | undefined = undefined;
        if (row.category) {
          category = await this.categoriesRepository.findOne({ where: { name: row.category } }) as Category;
          if (!category) {
            category = this.categoriesRepository.create({ name: row.category, taskType });
            await this.categoriesRepository.save(category);
          }
        }

        // 3. Tìm hoặc tạo Topic (Chỉ áp dụng nếu taskType là TASK_2 hoặc nếu có dữ liệu topic)
        let topic: Topic | undefined = undefined;
        if (row.topic) {
          topic = await this.topicsRepository.findOne({ where: { name: row.topic } }) as Topic;
          if (!topic) {
            topic = this.topicsRepository.create({ name: row.topic, taskType });
            await this.topicsRepository.save(topic);
          }
        }

        // 4. Kiểm tra trùng lặp (Upsert logic)
        const existingPrompt = await this.promptsRepository.findOne({
          where: { content, taskType }
        });

        const promptData = {
          content,
          taskType,
          category,
          topic,
          imageUrl: row.url || row.imageUrl || undefined,
          targetBand: row.targetBand ? Number(row.targetBand) : undefined,
          isFreeSample: row.isFreeSample === 'TRUE' || row.isFreeSample === true || row.isFreeSample === 'yes'
        };

        if (existingPrompt) {
          Object.assign(existingPrompt, promptData);
          await this.promptsRepository.save(existingPrompt);
          results.updated++;
        } else {
          const newPrompt = this.promptsRepository.create(promptData);
          await this.promptsRepository.save(newPrompt);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Dòng ${index + 2}: ${error.message}`);
      }
    }

    return results;
  }

  async exportToExcel(taskType?: TaskType) {
    const query: any = { relations: ['category', 'topic'] };
    if (taskType) {
      query.where = { taskType };
    }
    
    const prompts = await this.promptsRepository.find(query);
    const workbook = XLSX.utils.book_new();

    const taskTypes = [
      { type: TaskType.TASK_2, name: 'Task 2' },
      { type: TaskType.TASK_1_ACADEMIC, name: 'Task 1 Academic' },
      { type: TaskType.TASK_1_GENERAL, name: 'Task 1 General' }
    ];

    // Lọc loại task cần xuất
    const tasksToExport = taskType 
      ? taskTypes.filter(t => t.type === taskType)
      : taskTypes;

    for (const task of tasksToExport) {
      const taskPrompts = prompts.filter(p => p.taskType === task.type);
      const sheetData = taskPrompts.map(p => {
        const row: any = {};
        if (task.type === TaskType.TASK_2) {
          row.topic = p.topic?.name;
        }
        if (task.type === TaskType.TASK_1_ACADEMIC) {
          row.url = p.imageUrl;
        }
        row.category = p.category?.name;
        row.context = p.content;
        row.modelAnswer = p.modelAnswer;
        row.hints = p.hints;
        row.targetBand = p.targetBand;
        row.isFreeSample = p.isFreeSample;
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, task.name);
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
