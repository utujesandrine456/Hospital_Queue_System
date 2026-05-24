import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

export enum TicketStatus {
  WAITING   = 'waiting',
  SERVING   = 'serving',
  DONE      = 'done',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticketNumber: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.WAITING })
  status: TicketStatus;

  @Column({ nullable: true })
  patientName: string;

  @Column({ nullable: true })
  patientPhone: string;

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  bookedAt: Date;

  @Column({ nullable: true })
  servedAt: Date;

  @ManyToOne(() => Department, (dept) => dept.tickets, { eager: true })
  department: Department;
}