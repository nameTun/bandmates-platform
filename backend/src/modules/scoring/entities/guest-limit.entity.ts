import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// @Entity: Bảng lưu trữ giới hạn truy cập của khách vãng lai.
@Entity('guest_limits')
export class GuestLimit {
    // @PrimaryColumn: Chúng ta dùng visitorId làm khóa chính trực tiếp.
    // visitorId này được gửi từ client thông qua header 'x-visitor-id'.
    @PrimaryColumn()
    visitorId: string;

    // @Column: Đếm số lượng request trong ngày.
    @Column({ default: 0 })
    requestCount: number;

    // @Column: Lưu thời điểm request cuối cùng để biết khi nào cần reset counter (qua ngày mới).
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastRequestDate: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
