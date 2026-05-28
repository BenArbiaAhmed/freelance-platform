import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';

interface JoinPayload {
  contratId: string;
}

interface SendPayload {
  contratId: string;
  expediteurId: string;
  contenu: string;
}

@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() socket: Socket, @MessageBody() payload: JoinPayload) {
    if (!payload?.contratId) return;
    socket.join(this.room(payload.contratId));
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() socket: Socket, @MessageBody() payload: JoinPayload) {
    if (!payload?.contratId) return;
    socket.leave(this.room(payload.contratId));
  }

  @SubscribeMessage('send')
  async handleSend(@MessageBody() payload: SendPayload): Promise<Message | void> {
    if (!payload?.contratId || !payload?.expediteurId || !payload?.contenu) return;

    const saved = await this.messagesService.create({
      contratId: payload.contratId,
      expediteurId: payload.expediteurId,
      contenu: payload.contenu,
      lu: false,
    });

    this.server.to(this.room(payload.contratId)).emit('message', saved);
    return saved;
  }

  private room(contratId: string) {
    return `contrat:${contratId}`;
  }
}
