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
import { FreelanceProfilesService } from './freelance-profiles.service';
import { CreateFreelanceProfileDto } from './dto/create-freelance-profile.dto';
import { UpdateFreelanceProfileDto } from './dto/update-freelance-profile.dto';

@Controller('freelance-profiles')
export class FreelanceProfilesController {
  constructor(private readonly service: FreelanceProfilesService) {}

  @Post()
  create(@Body() dto: CreateFreelanceProfileDto) {
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
    @Body() dto: UpdateFreelanceProfileDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
