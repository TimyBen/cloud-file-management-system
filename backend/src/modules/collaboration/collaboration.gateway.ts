// src/modules/collaboration/collaboration.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CollaborationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CollaborationGateway.name);

  constructor(private collabService: CollaborationService) {}

  afterInit() {
    this.logger.log('🚀 Collaboration WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startSession')
  async handleStartSession(client: Socket, payload: { fileId: string; userId: string }) {
    const session = await this.collabService.startSession(payload.fileId, payload.userId);
    client.join(session.id);
    this.server.to(session.id).emit('sessionStarted', session);
  }

  @SubscribeMessage('sendEdit')
  handleEdit(client: Socket, payload: { sessionId: string; data: any }) {
    client.to(payload.sessionId).emit('receiveEdit', payload.data);
  }

  @SubscribeMessage('endSession')
  async handleEndSession(client: Socket, payload: { sessionId: string }) {
    const session = await this.collabService.endSession(payload.sessionId);
    this.server.to(payload.sessionId).emit('sessionEnded', session);
  }
}
