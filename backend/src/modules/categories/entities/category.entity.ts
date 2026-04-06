import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prompt } from '../../prompts/entities/prompt.entity';
import { TaskType } from '../../../common/enums/task-type.enum';

@Entity('prompt_categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string; // Tên dạng bài (Ví dụ: "Line Graph", "Opinion")

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK_2 })
    taskType: TaskType; // Phân loại theo Task (1 Academic, 1 General, 2)

    @Column({ type: 'text', nullable: true })
    description: string; // Mô tả hướng dẫn cho dạng bài này

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Prompt, prompt => prompt.category)
    prompts: Prompt[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
