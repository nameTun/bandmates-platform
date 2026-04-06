import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { Topic } from './entities/topic.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private promptsRepository: Repository<Prompt>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
  ) {}

  // Tạo đề thi thủ công
  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    const { topicName, ...promptData } = createPromptDto;

    // 1. Tìm hoặc tạo Topic dựa trên tên
    let topic = await this.topicsRepository.findOne({ where: { name: topicName } });
    
    if (!topic) {
      topic = this.topicsRepository.create({ name: topicName });
      await this.topicsRepository.save(topic);
    }

    // 2. Tạo prompt mới và gán topic
    const prompt = this.promptsRepository.create({
      ...promptData,
      topic: topic,
    });

    return this.promptsRepository.save(prompt);
  }

  // Lấy danh sách đề thi (phục vụ Admin Dashboard)
  async findAll(): Promise<Prompt[]> {
    return this.promptsRepository.find({
      relations: ['topic'],
      order: { createdAt: 'DESC' },
    });
  }

  // Tìm 1 đề bài theo ID
  async findOne(id: string): Promise<Prompt> {
    const prompt = await this.promptsRepository.findOne({
      where: { id },
      relations: ['topic'],
    });
    if (!prompt) throw new NotFoundException('Không tìm thấy đề bài này');
    return prompt;
  }
}
