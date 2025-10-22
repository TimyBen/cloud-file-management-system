import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * Global WebSocket Event Gateway
 * Handles real-time notifications such as:
 * - File shared
 * - File uploaded
 * - AI anomaly alert
 * - Compliance or retention notification
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events', // optional namespace to separate from collaboration
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  afterInit() {
    this.logger.log('✅ Events WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to /events: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from /events: ${client.id}`);
  }

  /**
   * Generic event listener – clients can join their own rooms
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { roomId: string }) {
    client.join(payload.roomId);
    this.logger.log(`Client ${client.id} joined room ${payload.roomId}`);
  }

  /**
   * File shared notification
   */
  @SubscribeMessage('fileShared')
  handleFileShared(client: Socket, payload: { fileId: string; sharedWith: string }) {
    this.logger.log(`File ${payload.fileId} shared with ${payload.sharedWith}`);
    this.server.to(payload.sharedWith).emit('notifyFileShared', payload);
  }

  /**
   * Broadcast AI alert (e.g. anomaly detection)
   */
  @SubscribeMessage('aiAlert')
  handleAIAlert(client: Socket, payload: { fileId: string; message: string; severity: string }) {
    this.logger.warn(`AI Alert: ${payload.message} (Severity: ${payload.severity})`);
    this.server.emit('notifyAIAlert', payload);
  }

  /**
   * Broadcast compliance/retention update
   */
  @SubscribeMessage('complianceUpdate')
  handleComplianceUpdate(client: Socket, payload: { fileId: string; status: string }) {
    this.logger.log(`Compliance update for file ${payload.fileId}: ${payload.status}`);
    this.server.emit('notifyComplianceUpdate', payload);
  }
}
