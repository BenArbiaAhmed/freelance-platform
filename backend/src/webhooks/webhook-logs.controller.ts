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
} from '@nestjs/common';
import { WebhookLogsService } from './webhook-logs.service';
import { CreateWebhookLogDto } from './dto/create-webhook-log.dto';
import { UpdateWebhookLogDto } from './dto/update-webhook-log.dto';

@Controller('webhook-logs')
export class WebhookLogsController {
  constructor(private readonly service: WebhookLogsService) {}

  @Post()
  create(@Body() dto: CreateWebhookLogDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWebhookLogDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
