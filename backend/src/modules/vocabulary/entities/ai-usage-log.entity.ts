import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ai_usage_logs')
export class AIUsageLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    user: User;

    @Index()
    @Column({ nullable: true })
    visitorId: string;

    @Index()
    @Column({ nullable: true })
    ipAddress: string;

    @Column()
    action: string; // 'ANALYSIS' | 'ENRICH'

    @CreateDateColumn()
    createdAt: Date;
}
