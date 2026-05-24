import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  emitQueueUpdate(departmentId: number, payload: any) {
    this.server.emit(`queue:${departmentId}`, payload);
  }

  @SubscribeMessage('joinDepartment')
  handleJoin(@MessageBody() departmentId: number) {
    return { event: 'joined', data: `Watching queue for dept ${departmentId}` };
  }
}