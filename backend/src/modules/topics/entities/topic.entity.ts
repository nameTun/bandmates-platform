import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prompt } from '../../prompts/entities/prompt.entity';
import { TaskType } from '../../../common/enums/task-type.enum';

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

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Prompt, prompt => prompt.topic)
    prompts: Prompt[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
