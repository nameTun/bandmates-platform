import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { CategoriesModule } from '../categories/categories.module';
import { TopicsModule } from '../topics/topics.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prompt]),
    CategoriesModule,
    TopicsModule,
    CloudinaryModule,
  ],
  controllers: [PromptsController],
  providers: [PromptsService],
  exports: [PromptsService],
})
export class PromptsModule {}
