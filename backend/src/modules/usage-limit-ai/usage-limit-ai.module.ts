import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsageLimitAi } from './entities/usage-limit-ai.entity';
import { UsageLimitAiService } from './usage-limit-ai.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLimitAi]),
    ConfigModule,
  ],
  providers: [UsageLimitAiService],
  exports: [UsageLimitAiService],
})
export class UsageLimitAiModule {}
