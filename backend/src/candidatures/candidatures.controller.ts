import {
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
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';

@Controller('candidatures')
export class CandidaturesController {
  constructor(private readonly service: CandidaturesService) {}

  @Post()
  create(@Body() dto: CreateCandidatureDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('freelanceId') freelanceId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.service.findAll({ freelanceId, clientId });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCandidatureDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/accept')
  accept(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.accept(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.reject(id);
  }

  @Sse('status/stream')
  statusStream(): Observable<MessageEvent> {
    return this.service.observeStatusChanges();
  }

  @Get(':id/resume')
  getFreelanceResume(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getFreelanceResume(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
