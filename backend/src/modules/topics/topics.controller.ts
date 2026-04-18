import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll() {
    return this.topicsService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateData: CreateTopicDto) {
    return this.topicsService.update(id, updateData);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string) {
    return this.topicsService.deactivate(id);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async importTopics(@UploadedFile() file: Express.Multer.File) {
    return this.topicsService.importFromExcel(file.buffer);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportTopics(@Res() res: express.Response) {
    const buffer = await this.topicsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="topics-export.xlsx"',
      'Content-Length': buffer.length,
    });
    return res.end(buffer);
  }
}
