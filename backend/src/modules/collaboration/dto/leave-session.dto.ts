import { IsUUID } from 'class-validator';

export class LeaveSessionDto {
  @IsUUID()
  sessionId: string;
}
