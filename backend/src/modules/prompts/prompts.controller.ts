import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  // API thêm đề bài thủ công - Chỉ dành cho Admin
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.create(createPromptDto);
  }

  // API lấy danh sách đề bài - Phục vụ hiển thị trên Dashboard Admin
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.promptsService.findAll();
  }

  // API lấy chi tiết 1 đề bài
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.promptsService.findOne(id);
  }
}
