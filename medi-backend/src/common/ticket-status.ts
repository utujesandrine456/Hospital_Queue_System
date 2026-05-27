export const TicketStatus = {
  waiting: 'waiting',
  serving: 'serving',
  done: 'done',
  cancelled: 'cancelled',
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
