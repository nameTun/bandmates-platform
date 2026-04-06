import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';

export class CreatePromptDto {
  @IsEnum(TaskType)
  @IsNotEmpty()
  taskType: TaskType;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string; // ID của PromptCategory (VD: d3b0... cho "Line Graph")

  @IsUUID()
  @IsOptional()
  topicId?: string; // ID của Topic (chỉ dùng cho Task 2, VD: "Education")

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
