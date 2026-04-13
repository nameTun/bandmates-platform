import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum ExamType {
    ACADEMIC = 'Academic',
    GENERAL = 'General',
}

@Entity('user_profiles')
export class UserProfile {
    // [KHÓA CHÍNH] ID định danh duy nhất cho hồ sơ
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // [QUAN HỆ] Liên kết 1-1 với bảng users. Database tự động tạo khóa ngoại userId.
    // Cascade delete đảm bảo nếu User bị xóa, Profile cũng bị xóa theo.
    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    // [HIỂN THỊ] Tên người dùng hiển thị trên giao diện (ví dụ: "Nguyễn Văn A")
    @Column({ nullable: true })
    displayName: string;

    // [HIỂN THỊ] Đường dẫn ảnh đại diện
    @Column({ nullable: true })
    avatarUrl: string;

    // --- CÁC TRƯỜNG DỮ LIỆU CUNG CẤP NGỮ CẢNH (CONTEXT) CHO AI ---

    // [AI CONTEXT] Band điểm hiện tại (ví dụ: 5.5) - Giúp AI tránh dùng từ vựng/ngữ pháp quá khó hoặc quá rườm rà.
    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    currentBand: number;

    // [AI CONTEXT] Band điểm mục tiêu (ví dụ: 7.0) - Giúp AI định hình lộ trình nâng band và khuyến nghị cấu trúc câu ăn điểm.
    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    targetBand: number;

    // [AI CONTEXT] Ngày thi dự kiến - Giúp nhắc nhở và lên lịch ôn tập.
    @Column({ type: 'date', nullable: true })
    targetDate: Date;

    // [AI CONTEXT] Loại bài thi - Cực kỳ quan trọng vì tiêu chí bài Task 1 của Academic (biểu đồ) hoàn toàn khác General (viết thư).
    @Column({ type: 'enum', enum: ExamType, nullable: true })
    examType: ExamType;

    // [AI CONTEXT] Kỹ năng cần cải thiện (vd: 'Grammar', 'Vocabulary') - Yêu cầu AI "vạch lá tìm sâu" và sửa lỗi kỹ ở phần này.
    @Column({ nullable: true })
    weakestSkill: string;

    // [AI CONTEXT] Mục đích học (vd: 'Du học', 'Định cư', 'Công việc') - Giúp AI điều chỉnh giọng văn (Tone & Style) sao cho phù hợp bối cảnh.
    @Column({ nullable: true })
    studyPurpose: string;

    // --- TRẠNG THÁI ---

    // [TRẠNG THÁI] Cờ đánh dấu người dùng đã hoàn thành khảo sát Onboarding hay chưa
    @Column({ default: false })
    isCompleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
