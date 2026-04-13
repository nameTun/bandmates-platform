import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitAi } from './entities/usage-limit-ai.entity';
import { UsageLimitAiService } from './usage-limit-ai.service';

@Global() // Đánh dấu Global để các module khác không cần import lại nhiều lần
@Module({
  imports: [TypeOrmModule.forFeature([UsageLimitAi])],
  providers: [UsageLimitAiService],
  exports: [UsageLimitAiService],
})
export class UsageLimitAiModule {}
