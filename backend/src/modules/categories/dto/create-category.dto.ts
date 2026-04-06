import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TaskType)
  @IsNotEmpty()
  taskType: TaskType;

  @IsString()
  @IsOptional()
  description?: string;
}
