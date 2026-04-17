import { IsEnum, IsOptional, IsString, IsUrl, IsUUID, IsBoolean } from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';

export class UpdatePromptDto {
  @IsEnum(TaskType)
  @IsOptional()
  taskType?: TaskType;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  modelAnswer?: string;

  @IsString()
  @IsOptional()
  hints?: string;

  @IsBoolean()
  @IsOptional()
  isFreeSample?: boolean;

  @IsOptional()
  targetBand?: number;
}
