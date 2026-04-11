import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vocabulary_history')
export class VocabularyHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index() // Đánh index cho word để tìm kiếm nhanh hơn
    @Column()
    word: string;

    @Column({ nullable: true })
    phonetic: string;

    @Column({ default: false })
    isSaved: boolean;

    @Column({ type: 'json', nullable: true })
    dictionaryData: any;

    @Column({ type: 'json', nullable: true })
    aiNotes: any;

    @Column({ type: 'json', nullable: true })
    familyData: any;

    @CreateDateColumn()
    searchedAt: Date;

    @ManyToOne(() => User, (user) => user.vocabularyHistories, { onDelete: 'CASCADE' })
    user: User;
}
