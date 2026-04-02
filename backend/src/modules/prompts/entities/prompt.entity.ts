import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from './topic.entity';

export enum TaskType {
    TASK_1_ACADEMIC = 'task_1_academic',
    TASK_1_GENERAL = 'task_1_general',
    TASK_2 = 'task_2',
}

@Entity('prompts')
export class Prompt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK_2 })
    taskType: TaskType;

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
