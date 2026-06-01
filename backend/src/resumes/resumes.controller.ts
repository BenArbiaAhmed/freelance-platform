import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const RESUME_UPLOAD_DIR = join(process.cwd(), 'uploads', 'resumes');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
};

function ensureUploadDir() {
  mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });
}

function resumeFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new BadRequestException('Only PDF or Word documents are allowed'),
      false,
    );
  }
  return cb(null, true);
}

@Controller('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FREELANCE)
export class ResumesController {
  constructor(private readonly service: ResumesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, RESUME_UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const originalExt = extname(file.originalname).toLowerCase();
          const mimeExt = EXT_BY_MIME[file.mimetype] ?? '';
          const ext = originalExt || mimeExt;
          const safeExt = ext && ext.startsWith('.') ? ext : '';
          cb(null, `${Date.now()}-${randomUUID()}${safeExt}`);
        },
      }),
      fileFilter: resumeFileFilter,
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateResumeDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }
    return this.service.create(file, dto, userId);
  }

  @Get()
  list(
    @Query('freelanceProfileId', new ParseUUIDPipe())
    freelanceProfileId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.service.listForProfile(freelanceProfileId, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.service.remove(id, userId);
  }
}
