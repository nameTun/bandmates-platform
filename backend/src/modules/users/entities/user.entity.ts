import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { VocabularyHistory } from '../../vocabulary/entities/vocabulary-history.entity';
import { UserProfile } from './user-profile.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
    // [KHÓA CHÍNH] ID định danh duy nhất
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // [XÁC THỰC] Email đăng nhập (duy nhất)
    @Column({ unique: true })
    email: string;

    // [XÁC THỰC] Mật khẩu đã mã hóa (ẩn khi query thông thường để bảo mật)
    @Column({ nullable: true, select: false })
    password: string;

    // [THIRD-PARTY] ID định danh khi đăng nhập qua Google
    @Column({ nullable: true })
    googleId: string;

    // [THIRD-PARTY] ID định danh khi đăng nhập qua Facebook
    @Column({ nullable: true })
    facebookId: string;

    // [BẢO MẬT] Token dùng để duy trì phiên đăng nhập dài hạn (ẩn khi query)
    @Column({ type: 'varchar', nullable: true, select: false })
    refreshToken: string | null;

    // [PHÂN QUYỀN] Vai trò của người dùng trong hệ thống (User / Admin)
    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    // [TRẠNG THÁI] Cho biết tài khoản có đang hoạt động hay bị khóa
    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // [QUAN HỆ] Thông tin cá nhân & dữ liệu khảo sát của người dùng.
    // 'cascade: true' cho phép tự động tạo/lưu Profile khi lưu User.
    @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
    profile: UserProfile;

    // [QUAN HỆ] Lịch sử tra cứu từ vựng
    @OneToMany(() => VocabularyHistory, (vh) => vh.user)
    vocabularyHistories: VocabularyHistory[];
}
