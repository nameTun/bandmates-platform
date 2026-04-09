import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VocabularyHistory } from '../../vocabulary/entities/vocabulary-history.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, select: false })
    password: string;

    @Column({ nullable: true })
    googleId: string;

    @Column({ nullable: true })
    facebookId: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'varchar', nullable: true, select: false })
    refreshToken: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    targetBand: number;

    @Column({ type: 'date', nullable: true })
    targetDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => VocabularyHistory, (vh) => vh.user)
    vocabularyHistories: VocabularyHistory[];
}
