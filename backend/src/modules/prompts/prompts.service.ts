import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { Topic } from '../topics/entities/topic.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

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

  // Lấy danh sách đề thi (phục vụ Admin Dashboard)
  async findAll(): Promise<Prompt[]> {
    return this.promptsRepository.find({
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
}
