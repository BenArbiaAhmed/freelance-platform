import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { LivrablesService } from './livrables.service';
import { CreateLivrableDto } from './dto/create-livrable.dto';
import { UpdateLivrableDto } from './dto/update-livrable.dto';

const LIVRABLE_UPLOAD_DIR = join(process.cwd(), 'uploads', 'livrables');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

@Controller('livrables')
export class LivrablesController {
  constructor(private readonly service: LivrablesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(LIVRABLE_UPLOAD_DIR, { recursive: true });
          cb(null, LIVRABLE_UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateLivrableDto,
  ) {
    if (!file) throw new BadRequestException('Deliverable file is required');
    return this.service.create({
      contratId: dto.contratId,
      titre: dto.titre,
      url: `/uploads/livrables/${file.filename}`,
      fileName: file.originalname,
    });
  }

  @Get()
  findAll(@Query('contratId') contratId?: string) {
    return this.service.findAll(contratId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLivrableDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
