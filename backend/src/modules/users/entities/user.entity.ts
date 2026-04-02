import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// @Entity: Đánh dấu class này tương ứng với một bảng trong cơ sở dữ liệu.
// Chúng ta đặt tên bảng là 'users' để rõ ràng.
@Entity('users')
export class User {
    // @PrimaryGeneratedColumn('uuid'): Sử dụng UUID làm khóa chính giúp tránh xung đột ID 
    // và bảo mật hơn so với ID số tự tăng (auto-increment) dễ đoán.
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @Column({ unique: true }): Đảm bảo không có 2 user nào trùng email.
    @Column({ unique: true })
    email: string;

    // @Column({ nullable: true }): Mật khẩu có thể null nếu user đăng nhập bằng Google (OAuth).
    // select: false đảm bảo không trả về password trong query thông thường.
    @Column({ nullable: true, select: false })
    password: string;

    // Lưu Google ID để nhận diện user khi đăng nhập bằng Google.
    @Column({ nullable: true })
    googleId: string;

    // Lưu Facebook ID để nhận diện user khi đăng nhập bằng Facebook.
    @Column({ nullable: true })
    facebookId: string;

    @Column({ nullable: true })
    name: string;

    // @Column({ select: false }): Quan trọng! 
    // select: false nghĩa là cột này sẽ KHÔNG được trả về trong các câu query thông thường 
    // (ví dụ findOne, find). Giúp tránh lộ hash token ra ngoài API.
    @Column({ type: 'varchar', nullable: true, select: false })
    refreshToken: string | null;

    // @Column({ default: 'user' }): Phân quyền User (admin, user) - Phục vụ tính năng sau này.
    @Column({ default: 'user' })
    role: string;

    // Mục tiêu Band điểm mà User muốn đạt được (ví dụ: 6.5, 7.0, 7.5).
    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    targetBand: number;

    // Ngày thi IELTS dự kiến — giúp hệ thống tính countdown và đề xuất kế hoạch ôn luyện.
    @Column({ type: 'date', nullable: true })
    targetDate: Date;

    // @CreateDateColumn: Tự động lưu thời gian tạo record.
    @CreateDateColumn()
    createdAt: Date;

    // @UpdateDateColumn: Tự động cập nhật thời gian mỗi khi record thay đổi.
    @UpdateDateColumn()
    updatedAt: Date;
}
