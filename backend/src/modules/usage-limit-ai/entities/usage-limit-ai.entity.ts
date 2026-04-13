import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('usage_limit_ai')
export class UsageLimitAi {
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
    action: string; // 'PRACTICE' | 'VOCAB_ANALYSIS' | 'VOCAB_ENRICH'

    @CreateDateColumn()
    createdAt: Date;
}
