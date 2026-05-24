import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { QueueGateway } from './queue.gateway';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, QueueGateway],
})
export class TicketsModule {}
