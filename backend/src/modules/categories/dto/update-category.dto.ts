import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TaskType)
  @IsOptional()
  taskType?: TaskType;

  @IsString()
  @IsOptional()
  description?: string;
}
