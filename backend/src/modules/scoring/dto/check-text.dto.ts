import { IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsInt, IsUUID } from 'class-validator';

export class CheckTextDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(10, { message: 'Text must be at least 10 characters long' })
    @MaxLength(5000, { message: 'Text cannot exceed 5000 characters' })
    text: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid Prompt ID format' })
    promptId?: string;

    @IsOptional()
    @IsInt()
    timeSpent?: number;
}
