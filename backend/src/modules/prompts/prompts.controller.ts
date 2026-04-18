import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Res, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TaskType } from '../../common/enums/task-type.enum';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) { }

  // API thêm đề bài thủ công - Chỉ dành cho Admin
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.create(createPromptDto);
  }

  // API cập nhật đề bài - Chỉ dành cho Admin
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updatePromptDto: UpdatePromptDto) {
    return this.promptsService.update(id, updatePromptDto);
  }

  // API xoá đề bài - Chỉ dành cho Admin
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.promptsService.remove(id);
  }

  // API lấy danh sách đề bài - Phục vụ hiển thị trên Dashboard Admin và Practice Library
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@GetUser() user: any) {
    return this.promptsService.findAll(user);
  }

  // API lấy chi tiết 1 đề bài
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.promptsService.findOne(id);
  }

  // --- EXCEL IMPORT/EXPORT ---

  @Post('import/task2')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importPromptsTask2(@UploadedFile() file: Express.Multer.File) {
    return this.promptsService.importPromptsTask2(file.buffer);
  }

  @Post('import/task1-academic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importPromptsTask1Academic(@UploadedFile() file: Express.Multer.File) {
    return this.promptsService.importPromptsTask1Academic(file.buffer);
  }

  @Post('import/task1-general')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importPromptsTask1General(@UploadedFile() file: Express.Multer.File) {
    return this.promptsService.importPromptsTask1General(file.buffer);
  }

  @Get('export/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportAll(@Res() res: express.Response) {
    const buffer = await this.promptsService.exportToExcel();
    return this.sendExcelResponse(res, buffer, 'prompts-all-export.xlsx');
  }

  @Get('export/task2')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportTask2(@Res() res: express.Response) {
    const buffer = await this.promptsService.exportToExcel(TaskType.TASK_2);
    return this.sendExcelResponse(res, buffer, 'prompts-task2-export.xlsx');
  }

  @Get('export/task1-academic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportTask1Academic(@Res() res: express.Response) {
    const buffer = await this.promptsService.exportToExcel(TaskType.TASK_1_ACADEMIC);
    return this.sendExcelResponse(res, buffer, 'prompts-task1-academic-export.xlsx');
  }

  @Get('export/task1-general')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportTask1General(@Res() res: express.Response) {
    const buffer = await this.promptsService.exportToExcel(TaskType.TASK_1_GENERAL);
    return this.sendExcelResponse(res, buffer, 'prompts-task1-general-export.xlsx');
  }

  private sendExcelResponse(res: express.Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
