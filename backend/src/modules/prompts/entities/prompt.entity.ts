import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import {Topic} from '../../topics/entities/topic.entity';
import { Category } from '../../categories/entities/category.entity';
import { TaskType } from '../../../common/enums/task-type.enum';

@Entity('prompts')
export class Prompt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK_2 })
    taskType: TaskType;

    @ManyToOne(() => Category, category => category.prompts, { eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: Category; // Liên kết động đến bảng Category

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    targetBand: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageUrl: string;

    @Column({ type: 'text', nullable: true })
    modelAnswer: string;

    @Column({ type: 'text', nullable: true })
    hints: string;

    @ManyToOne(() => Topic, topic => topic.prompts, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'topicId' })
    topic: Topic;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
