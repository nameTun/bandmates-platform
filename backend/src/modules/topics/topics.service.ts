import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';

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
}
