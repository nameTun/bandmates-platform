import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiUsage } from './entities/ai-usage.entity';
import { AiSeedService } from './ai-seed.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AiUsage])
    ],
    providers: [AiService, AiSeedService],
    exports: [AiService, TypeOrmModule],
})
export class AiModule {}
