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
import { FreelanceCompetencesService } from './freelance-competences.service';
import { CreateFreelanceCompetenceDto } from './dto/create-freelance-competence.dto';
import { UpdateFreelanceCompetenceDto } from './dto/update-freelance-competence.dto';

@Controller('freelance-competences')
export class FreelanceCompetencesController {
  constructor(private readonly service: FreelanceCompetencesService) {}

  @Post()
  create(@Body() dto: CreateFreelanceCompetenceDto) {
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
    @Body() dto: UpdateFreelanceCompetenceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
