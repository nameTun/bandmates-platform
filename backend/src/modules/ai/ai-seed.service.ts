import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsage } from './entities/ai-usage.entity';
import { AI_LIMITS } from '../../config/ai-models.config';

@Injectable()
export class AiSeedService implements OnModuleInit {
    constructor(
        @InjectRepository(AiUsage)
        private aiUsageRepository: Repository<AiUsage>,
    ) {}

    async onModuleInit() {
        console.log('[AiSeed] Đang kiểm tra và khởi tạo dữ liệu hạn mức AI...');
        
        for (const modelName of Object.keys(AI_LIMITS)) {
            const exists = await this.aiUsageRepository.findOne({ where: { modelName } });
            
            if (!exists) {
                const newUsage = this.aiUsageRepository.create({
                    modelName,
                    currentRPM: 0,
                    currentRPD: 0,
                    lastRequestAt: new Date(),
                    resetDayAt: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).split(' ')[0],
                });
                await this.aiUsageRepository.save(newUsage);
                console.log(`[AiSeed] Đã tạo mặc định cho model: ${modelName}`);
            }
        }
        
        console.log('[AiSeed] Hoàn tất khởi tạo.');
    }
}
