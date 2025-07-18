import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { CollaborationEvent } from '../../application/collaboration/collaborationService';

export interface SessionSocketData {
  sessionId: string;
  participantId: string;
  participantName: string;
}

export interface ClientToServerEvents {
  'join-session': (data: { sessionId: string; participantName: string }) => void;
  'leave-session': (data: { sessionId: string }) => void;
  'add-song-line': (data: { sessionId: string; prompt: string }) => void;
  'reorder-lines': (data: { sessionId: string; lineIds: string[] }) => void;
  'complete-session': (data: { sessionId: string }) => void;
}

export interface ServerToClientEvents {
  'user-joined': (data: { participantId: string; participantName: string }) => void;
  'user-left': (data: { participantId: string }) => void;
  'line-added': (data: { sessionId: string; line: any }) => void;
  'lines-reordered': (data: { sessionId: string; lineIds: string[] }) => void;
  'session-completed': (data: { sessionId: string; exportResult: any }) => void;
  'collaboration-event': (event: CollaborationEvent) => void;
  'error': (data: { message: string; code?: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export type SocketIOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SessionSocketData>;
export type SocketIOSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SessionSocketData>;

export class SocketManager {
  private io: SocketIOServer;
  private sessionParticipants: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: SocketIOSocket) => {
      console.log('User connected:', socket.id);

      socket.on('join-session', async (data) => {
        try {
          await this.handleJoinSession(socket, data);
        } catch (error) {
          socket.emit('error', { 
            message: 'Failed to join session', 
            code: 'JOIN_FAILED' 
          });
        }
      });

      socket.on('leave-session', async (data) => {
        await this.handleLeaveSession(socket, data);
      });

      socket.on('add-song-line', (data) => {
        // This will be handled by the application layer
        socket.to(data.sessionId).emit('line-added', { 
          sessionId: data.sessionId, 
          line: { prompt: data.prompt } 
        });
      });

      socket.on('reorder-lines', (data) => {
        socket.to(data.sessionId).emit('lines-reordered', data);
      });

      socket.on('complete-session', (data) => {
        socket.to(data.sessionId).emit('session-completed', { 
          sessionId: data.sessionId, 
          exportResult: null 
        });
      });

      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinSession(socket: SocketIOSocket, data: { sessionId: string; participantName: string }): Promise<void> {
    const { sessionId, participantName } = data;
    
    // Join the room
    await socket.join(sessionId);
    
    // Store participant data
    socket.data.sessionId = sessionId;
    socket.data.participantId = socket.id;
    socket.data.participantName = participantName;
    
    // Track participants in session
    if (!this.sessionParticipants.has(sessionId)) {
      this.sessionParticipants.set(sessionId, new Set());
    }
    this.sessionParticipants.get(sessionId)!.add(socket.id);
    
    // Notify others in the session
    socket.to(sessionId).emit('user-joined', {
      participantId: socket.id,
      participantName: participantName
    });
    
    console.log(`User ${socket.id} (${participantName}) joined session ${sessionId}`);
  }

  private async handleLeaveSession(socket: SocketIOSocket, data: { sessionId: string }): Promise<void> {
    const { sessionId } = data;
    
    await socket.leave(sessionId);
    
    // Remove from participants tracking
    const participants = this.sessionParticipants.get(sessionId);
    if (participants) {
      participants.delete(socket.id);
      if (participants.size === 0) {
        this.sessionParticipants.delete(sessionId);
      }
    }
    
    // Notify others in the session
    socket.to(sessionId).emit('user-left', {
      participantId: socket.id
    });
    
    console.log(`User ${socket.id} left session ${sessionId}`);
  }

  private async handleDisconnect(socket: SocketIOSocket): Promise<void> {
    const sessionId = socket.data.sessionId;
    
    if (sessionId) {
      await this.handleLeaveSession(socket, { sessionId });
    }
    
    console.log('User disconnected:', socket.id);
  }

  // Public methods for application layer to use
  public broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(sessionId).emit(event as any, data);
  }

  public broadcastCollaborationEvent(sessionId: string, event: CollaborationEvent): void {
    this.io.to(sessionId).emit('collaboration-event', event);
  }

  public getSessionParticipants(sessionId: string): string[] {
    const participants = this.sessionParticipants.get(sessionId);
    return participants ? Array.from(participants) : [];
  }

  public getConnectedSessions(): string[] {
    return Array.from(this.sessionParticipants.keys());
  }

  public getServer(): SocketIOServer {
    return this.io;
  }
}