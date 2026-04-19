import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiUsage } from './entities/ai-usage.entity';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AiUsage])
    ],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule {}
