import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { TaskType } from '../../../common/enums/task-type.enum';

// Bảng lưu trữ hướng dẫn chấm điểm cho AI.
// Mỗi bản ghi chứa nội dung hướng dẫn cho 1 tiêu chí (TA/CC/LR/GRA) của 1 loại Task.
// Ví dụ: Task 2 + TA = "Task Response evaluates how well..."
// Admin có thể chỉnh sửa nội dung để cải thiện chất lượng chấm điểm mà không cần sửa code.
@Entity('scoring_criteria')
@Unique(['taskType', 'criteriaKey']) // Đảm bảo không có 2 bản ghi trùng (task_2, TA)
export class ScoringCriteria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Loại Task mà tiêu chí này áp dụng (task_1_academic, task_1_general, task_2).
    @Column({ type: 'enum', enum: TaskType })
    taskType: TaskType;

    // Mã tiêu chí: TA (Task Achievement/Response), CC, LR, GRA.
    @Column()
    criteriaKey: string;

    // Nội dung chi tiết — sẽ được gửi trực tiếp cho AI đọc khi chấm bài.
    @Column({ type: 'text' })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
