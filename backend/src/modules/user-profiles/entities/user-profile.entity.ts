import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExamType {
    ACADEMIC = 'Academic',
    GENERAL = 'General',
}

export enum StudyPurpose {
    GRADUATION = 'Graduation',       // Xét tốt nghiệp
    STUDY_ABROAD = 'Study Abroad',     // Du học
    WORK_VISA = 'Immigration',         // Định cư
    JOB_APPLICATION = 'Job Application',// Xin việc/Phỏng vấn
    PROMOTION = 'Career Promotion',    // Thăng tiến sự nghiệp
    PERSONAL_INTEREST = 'Personal',    // Trau dồi cá nhân
}

export enum WritingFocus {
    TASK_RESPONSE = 'Task Response',
    COHERENCE_COHESION = 'Coherence & Cohesion',
    LEXICAL_RESOURCE = 'Vocabulary',
    GRAMMAR_ACCURACY = 'Grammar',
    IDEA_GENERATION = 'Ideas',
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

    // Sử dụng JSON để lưu mảng đa lựa chọn (tối đa 3)
    @Column({ type: 'json', nullable: true })
    weakestSkill: WritingFocus[];

    // Sử dụng Enum cho mục đích học tập
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
