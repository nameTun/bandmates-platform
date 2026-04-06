import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prompt } from './prompt.entity';
import { TaskType } from './prompt.types';

@Entity('topics')
export class Topic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK_2 })
    taskType: TaskType;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => Prompt, prompt => prompt.topic)
    prompts: Prompt[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
