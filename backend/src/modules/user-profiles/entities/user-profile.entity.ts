import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExamType {
    ACADEMIC = 'Academic',
    GENERAL = 'General',
}

export enum StudyPurpose {
    STUDY_ABROAD = 'Study Abroad', // Du học
    IMMIGRATION = 'Immigration',   // Định cư
    WORK = 'Work',                 // Công việc
    PERSONAL = 'Personal Interest',// Tu dưỡng cá nhân
    OTHER = 'Other',               // Khác
}

export enum IeltsSkill {
    READING = 'Reading',
    WRITING = 'Writing',
    LISTENING = 'Listening',
    SPEAKING = 'Speaking',
    GRAMMAR = 'Grammar',
    VOCABULARY = 'Vocabulary',
}

@Entity('user_profiles')
export class UserProfile {
    // [KHÓA CHÍNH] ID định danh duy nhất cho hồ sơ
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // [QUAN HỆ] Liên kết 1-1 với bảng users. Database tự động tạo khóa ngoại userId.
    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    // [HIỂN THỊ] Tên người dùng hiển thị trên giao diện
    @Column({ nullable: true })
    displayName: string;

    // [HIỂN THỊ] Đường dẫn ảnh đại diện
    @Column({ nullable: true })
    avatarUrl: string;

    // --- CÁC TRƯỜNG DỮ LIỆU CUNG CẤP NGỮ CẢNH (CONTEXT) CHO AI ---

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    currentBand: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    targetBand: number;

    @Column({ type: 'date', nullable: true })
    targetDate: Date;

    @Column({ type: 'enum', enum: ExamType, nullable: true })
    examType: ExamType;

    // Cải tiến: Sử dụng Enum để đồng nhất dữ liệu
    @Column({ type: 'enum', enum: IeltsSkill, nullable: true })
    weakestSkill: IeltsSkill;

    // Cải tiến: Sử dụng Enum cho mục đích học tập
    @Column({ type: 'enum', enum: StudyPurpose, nullable: true })
    studyPurpose: StudyPurpose;

    // --- TRẠNG THÁI ---

    // [TRẠNG THÁI] Cờ đánh dấu người dùng đã hoàn thành khảo sát Onboarding hay chưa
    @Column({ default: false })
    isOnboardingCompleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
