import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { Department } from '../departments/entities/department.entity';
import { QueueGateway } from './queue.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Department])],
  controllers: [TicketsController],
  providers: [TicketsService, QueueGateway],
})
export class TicketsModule {}