import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private svc: TicketsService) { }

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.svc.create(dto);
  }

  @Get('active')
  getAllActive() {
    return this.svc.getAllActive();
  }

  @Get('admin/recent')
  @UseGuards(JwtAuthGuard)
  getRecentForAdmin() {
    return this.svc.getRecentForAdmin();
  }

  @Get('queue/:departmentId')
  getQueue(@Param('departmentId', ParseIntPipe) id: number) {
    return this.svc.getQueue(id);
  }

  @Get('queue/:departmentId/integrity')
  getQueueIntegrity(@Param('departmentId', ParseIntPipe) id: number) {
    return this.svc.getQueueIntegrity(id);
  }

  @Get('stats/:departmentId')
  @UseGuards(JwtAuthGuard)
  getStats(@Param('departmentId', ParseIntPipe) id: number) {
    return this.svc.getStats(id);
  }

  /** Returns all active tickets for a patient session (public) */
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.svc.getTicketsByPatient(patientId);
  }

  @Put('patient/:patientId/choose/:ticketId')
  chooseServingTicket(
    @Param('patientId') patientId: string,
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ) {
    return this.svc.chooseServingTicket(patientId, ticketId);
  }

  @Get(':id')
  getTicket(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getTicket(id);
  }

  @Put('next/:departmentId')
  @UseGuards(JwtAuthGuard)
  callNext(@Param('departmentId', ParseIntPipe) id: number) {
    return this.svc.callNext(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.svc.cancel(id);
  }
}
