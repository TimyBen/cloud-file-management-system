import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
@WebSocketGateway({
  path: '/collab',
  cors: { origin: '*' },
  namespace: '/collab',
})
export class CollaborationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(CollaborationGateway.name);

  afterInit(server: Server) {
    this.logger.log('CollaborationGateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as any;
      client.data.user = { id: payload.sub, email: payload.email, role: payload.role };
      this.logger.log(`Client connected: ${client.id} user=${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${err?.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // optional: emit leave events if you track socket->session mapping
  }

  private extractToken(client: Socket): string | null {
    const auth =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!auth) return null;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.split(' ')[1];
    return typeof auth === 'string' ? auth : null;
  }

  /**
   * Helper to notify all clients in a session room
   */
  notifyToSession(sessionId: string, event: string, payload: any) {
    this.server.to(sessionId).emit(event, payload);
  }

  /**
   * Client can request to join a session room over WS (server will NOT persist — service should be used)
   */
  @SubscribeMessage('join')
  async onJoin(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sessionId = data.sessionId;
    if (!sessionId) {
      client.emit('error', { message: 'sessionId required' });
      return;
    }
    client.join(sessionId);
    client.emit('joined', { sessionId });
    this.notifyToSession(sessionId, 'participant.connected', { socketId: client.id, user: client.data.user });
  }

  @SubscribeMessage('leave')
  async onLeave(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sessionId = data.sessionId;
    if (sessionId) {
      client.leave(sessionId);
      client.emit('left', { sessionId });
      this.notifyToSession(sessionId, 'participant.disconnected', { socketId: client.id, user: client.data.user });
    }
  }

  @SubscribeMessage('broadcast')
  async onBroadcast(
    @MessageBody() data: { sessionId: string; event: string; payload: any },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.sessionId || !data?.event) {
      client.emit('error', { message: 'sessionId and event required' });
      return;
    }
    this.server
      .to(data.sessionId)
      .emit(data.event, { from: client.data.user, payload: data.payload });
  }
}
