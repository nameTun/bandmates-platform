import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType, StudyPurpose, IeltsSkill } from '../entities/user-profile.entity';

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
    @IsEnum(IeltsSkill)
    weakestSkill?: IeltsSkill;

    @IsOptional()
    @IsEnum(StudyPurpose)
    studyPurpose?: StudyPurpose;
}
