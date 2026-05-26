import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrat } from './entities/contrat.entity';
import { Livrable } from './entities/livrable.entity';
import { Message } from './entities/message.entity';
import { ContratsService } from './contrats.service';
import { ContratsController } from './contrats.controller';
import { LivrablesService } from './livrables.service';
import { LivrablesController } from './livrables.controller';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contrat, Livrable, Message])],
  controllers: [ContratsController, LivrablesController, MessagesController],
  providers: [ContratsService, LivrablesService, MessagesService],
  exports: [ContratsService, LivrablesService, MessagesService],
})
export class ContratsModule {}
