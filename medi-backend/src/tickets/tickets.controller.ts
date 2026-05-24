import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private svc: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) { return this.svc.create(dto); }

  @Get(':id')
  getTicket(@Param('id') id: number) { return this.svc.getTicket(id); }

  @Get('queue/:departmentId')
  getQueue(@Param('departmentId') id: number) { return this.svc.getQueue(id); }

  @Put('next/:departmentId')
  @UseGuards(JwtAuthGuard)
  callNext(@Param('departmentId') id: number) { return this.svc.callNext(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: number) { return this.svc.cancel(id); }
  
  @Get('stats/:departmentId')
  @UseGuards(JwtAuthGuard)
  getStats(@Param('departmentId') id: number) { return this.svc.getStats(id); }
}