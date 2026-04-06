import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';

export class CreatePromptDto {
  @IsEnum(TaskType)
  @IsNotEmpty()
  taskType: TaskType;

  @IsString()
  @IsNotEmpty()
  topicName: string; // Admin nhập tên Topic, Service sẽ tự tìm TopicId tương ứng

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  modelAnswer?: string;

  @IsString()
  @IsOptional()
  hints?: string;
}
