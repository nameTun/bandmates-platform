import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType, StudyPurpose, WritingFocus } from '../entities/user-profile.entity';

export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsNumber()
    currentBand?: number;

    @IsOptional()
    @IsNumber()
    targetBand?: number;

    @IsOptional()
    @Type(() => Date)
    targetDate?: Date;

    @IsOptional()
    @IsEnum(ExamType)
    examType?: ExamType;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(3)
    @IsEnum(WritingFocus, { each: true })
    weakestSkill?: WritingFocus[];

    @IsOptional()
    @IsEnum(StudyPurpose)
    studyPurpose?: StudyPurpose;
}
