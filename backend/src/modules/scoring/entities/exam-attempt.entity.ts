import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Prompt } from '../../prompts/entities/prompt.entity';

// Bảng lưu trữ lịch sử chấm điểm — là bảng trung tâm của hệ thống phân tích.
@Entity('exam_attempts')
export class ExamAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Bài viết gốc của người dùng.
    @Column({ type: 'text' })
    originalText: string;

    // Lưu trữ nguyên vẹn kết quả JSON từ Gemini (bao gồm feedback chi tiết, common_errors, improved_version).
    @Column({ type: 'json', nullable: true })
    aiResponse: any;

    // --- Điểm thành phần (tách ra cột riêng để hỗ trợ query thống kê & biểu đồ) ---
    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    overallScore: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    scoreTA: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    scoreCC: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    scoreLR: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    scoreGRA: number;

    // --- Thông tin bài làm ---
    // Lần làm bài thứ mấy cho cùng 1 đề (hỗ trợ Versioning / so sánh tiến bộ).
    @Column({ type: 'int', default: 1 })
    attemptNumber: number;

    // Số lượng từ trong bài viết (IELTS yêu cầu tối thiểu 150/250 từ).
    @Column({ type: 'int', default: 0 })
    wordCount: number;

    // Thời gian User bỏ ra để hoàn thành bài (tính bằng giây).
    @Column({ type: 'int', default: 0 })
    timeSpent: number;

    // Trạng thái chấm bài: pending (đang xử lý), success (thành công), failed (AI lỗi).
    @Column({
        type: 'enum',
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    })
    status: string;

    // --- Quan hệ ---
    // Liên kết với User (nullable: Guest cũng có thể chấm điểm).
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    // Liên kết với Prompt (đề bài) — nullable vì User có thể tự nhập đề.
    @ManyToOne(() => Prompt, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'promptId' })
    prompt: Prompt | null;

    // Nếu là Guest, lưu visitorId để tracking.
    @Column({ nullable: true })
    visitorId: string;

    @CreateDateColumn()
    createdAt: Date;
}
