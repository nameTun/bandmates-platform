import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateScoringCriteriaDto {
    @IsNotEmpty({ message: 'Nội dung tiêu chí không được để trống' })
    @IsString({ message: 'Nội dung tiêu chí phải là chuỗi văn bản' })
    description: string;
}
