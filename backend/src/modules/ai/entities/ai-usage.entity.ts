import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_usage')
export class AiUsage {
    @PrimaryColumn()
    modelName: string;

    @Column({ default: 0 })
    currentRPM: number;

    @Column({ default: 0 })
    currentRPD: number;

    @UpdateDateColumn()
    lastRequestAt: Date;

    @Column({ type: 'varchar', length: 10, default: '' })
    resetDayAt: string; // Định dạng YYYY-MM-DD
}
