import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

// @Entity: Bảng lưu trữ lịch sử chấm điểm.
@Entity('exam_attempts')
export class ExamAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Input text của người dùng gửi lên để chấm điểm.
    @Column({ type: 'text' })
    originalText: string;

    // @Column({ type: 'json' }): Lưu trữ nguyên vẹn kết quả trả về từ Gemini.
    // MySQL hỗ trợ kiểu dữ liệu JSON, giúp việc query sau này linh hoạt.
    @Column({ type: 'json' })
    aiResponse: any;

    // Quan hệ Many-to-One với bảng User.
    // nullable: true vì "Guest" cũng có thể chấm điểm mà không cần login.
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    // Nếu là Guest, chúng ta lưu visitorId để tracking (tùy chọn).
    @Column({ nullable: true })
    visitorId: string;

    @CreateDateColumn()
    createdAt: Date;
}
