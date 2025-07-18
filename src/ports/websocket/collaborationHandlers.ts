import { Server, Socket } from 'socket.io';
import { CollaborationService, CollaborationEvent } from '../../application/collaboration/collaborationService';
import { SessionService } from '../../application/session/sessionService';
import { Context } from '../../types';

export interface WebSocketConfig {
  io: Server;
  collaborationService: CollaborationService;
  sessionService: SessionService;
}

export interface SessionSocketData {
  sessionId?: string;
  participantId?: string;
  participantName?: string;
  userId?: string;
}

export interface ClientToServerEvents {
  'join-session': (data: { sessionId: string; participantName: string; userId?: string }) => void;
  'leave-session': (data: { sessionId: string }) => void;
  'add-song-line': (data: { sessionId: string; prompt: string }) => void;
  'reorder-lines': (data: { sessionId: string; lineIds: string[] }) => void;
  'complete-session': (data: { sessionId: string }) => void;
}

export interface ServerToClientEvents {
  'participant-joined': (data: { participant: any; sessionId: string }) => void;
  'participant-left': (data: { participantId: string; sessionId: string }) => void;
  'song-line-added': (data: { songLine: any; sessionId: string }) => void;
  'lines-reordered': (data: { lineIds: string[]; sessionId: string }) => void;
  'session-completed': (data: { exportResult: any; sessionId: string }) => void;
  'collaboration-event': (event: CollaborationEvent) => void;
  'session-updated': (data: { session: any }) => void;
  'error': (data: { message: string; code?: string; details?: any }) => void;
  'connection-confirmed': (data: { socketId: string; timestamp: string }) => void;
}

export type CollaborationSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SessionSocketData>;

export function registerCollaborationHandlers(config: WebSocketConfig): void {
  const { io, collaborationService, sessionService } = config;
  
  io.on('connection', (socket: CollaborationSocket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);
    
    // Send connection confirmation
    socket.emit('connection-confirmed', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Handle join-session event
    socket.on('join-session', async (data) => {
      try {
        await handleJoinSession(socket, data, collaborationService, sessionService);
      } catch (error) {
        console.error('Error handling join-session:', error);
        socket.emit('error', {
          message: 'Failed to join session',
          code: 'JOIN_SESSION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle leave-session event
    socket.on('leave-session', async (data) => {
      try {
        await handleLeaveSession(socket, data, collaborationService);
      } catch (error) {
        console.error('Error handling leave-session:', error);
        socket.emit('error', {
          message: 'Failed to leave session',
          code: 'LEAVE_SESSION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle add-song-line event
    socket.on('add-song-line', async (data) => {
      try {
        await handleAddSongLine(socket, data, collaborationService);
      } catch (error) {
        console.error('Error handling add-song-line:', error);
        socket.emit('error', {
          message: 'Failed to add song line',
          code: 'ADD_LINE_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle reorder-lines event
    socket.on('reorder-lines', async (data) => {
      try {
        await handleReorderLines(socket, data, collaborationService);
      } catch (error) {
        console.error('Error handling reorder-lines:', error);
        socket.emit('error', {
          message: 'Failed to reorder lines',
          code: 'REORDER_LINES_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle complete-session event
    socket.on('complete-session', async (data) => {
      try {
        await handleCompleteSession(socket, data, collaborationService);
      } catch (error) {
        console.error('Error handling complete-session:', error);
        socket.emit('error', {
          message: 'Failed to complete session',
          code: 'COMPLETE_SESSION_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle disconnect event
    socket.on('disconnect', async (reason) => {
      try {
        await handleDisconnect(socket, reason, collaborationService);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

async function handleJoinSession(
  socket: CollaborationSocket,
  data: { sessionId: string; participantName: string; userId?: string },
  collaborationService: CollaborationService,
  sessionService: SessionService
): Promise<void> {
  const { sessionId, participantName, userId } = data;
  
  console.log(`👤 ${participantName} (${socket.id}) joining session ${sessionId}`);
  
  // Create context
  const context: Context = {
    userId: userId || socket.id,
    sessionId,
    timestamp: new Date()
  };
  
  // Verify session exists
  const session = await sessionService.getSession(context, sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  // Join the session room
  await socket.join(sessionId);
  
  // Store participant data in socket
  socket.data.sessionId = sessionId;
  socket.data.participantName = participantName;
  socket.data.userId = userId || socket.id;
  socket.data.participantId = socket.id;
  
  // Join session through collaboration service
  const participant = await collaborationService.joinSession(context, sessionId, participantName);
  
  // Update session and broadcast to other participants
  const updatedSession = await sessionService.getSession(context, sessionId);
  
  socket.to(sessionId).emit('participant-joined', {
    participant,
    sessionId
  });
  
  // Send current session state to the joining participant
  socket.emit('session-updated', {
    session: updatedSession
  });
  
  console.log(`✅ ${participantName} successfully joined session ${sessionId}`);
}

async function handleLeaveSession(
  socket: CollaborationSocket,
  data: { sessionId: string },
  collaborationService: CollaborationService
): Promise<void> {
  const { sessionId } = data;
  const participantId = socket.data.participantId || socket.id;
  const participantName = socket.data.participantName || 'Unknown';
  
  console.log(`👋 ${participantName} (${participantId}) leaving session ${sessionId}`);
  
  const context: Context = {
    userId: socket.data.userId || socket.id,
    sessionId,
    timestamp: new Date()
  };
  
  // Leave session through collaboration service
  await collaborationService.leaveSession(context, sessionId, participantId);
  
  // Leave the socket room
  await socket.leave(sessionId);
  
  // Notify other participants
  socket.to(sessionId).emit('participant-left', {
    participantId,
    sessionId
  });
  
  // Clear socket data
  socket.data.sessionId = undefined;
  socket.data.participantId = undefined;
  socket.data.participantName = undefined;
  
  console.log(`✅ ${participantName} successfully left session ${sessionId}`);
}

async function handleAddSongLine(
  socket: CollaborationSocket,
  data: { sessionId: string; prompt: string },
  collaborationService: CollaborationService
): Promise<void> {
  const { sessionId, prompt } = data;
  
  console.log(`🎵 Adding song line to session ${sessionId}: "${prompt}"`);
  
  const context: Context = {
    userId: socket.data.userId || socket.id,
    sessionId,
    timestamp: new Date()
  };
  
  // Add song line through collaboration service (which will broadcast the event)
  const songLine = await collaborationService.addSongLineRealtime(context, sessionId, prompt);
  
  // Broadcast to all participants in the session (including sender)
  socket.to(sessionId).emit('song-line-added', {
    songLine,
    sessionId
  });
  
  console.log(`✅ Song line added to session ${sessionId}: "${songLine.content}"`);
}

async function handleReorderLines(
  socket: CollaborationSocket,
  data: { sessionId: string; lineIds: string[] },
  collaborationService: CollaborationService
): Promise<void> {
  const { sessionId, lineIds } = data;
  
  console.log(`🔄 Reordering lines in session ${sessionId}:`, lineIds);
  
  const context: Context = {
    userId: socket.data.userId || socket.id,
    sessionId,
    timestamp: new Date()
  };
  
  // Reorder lines through collaboration service
  await collaborationService.reorderLinesRealtime(context, sessionId, lineIds);
  
  // Broadcast to all participants in the session (including sender)
  socket.to(sessionId).emit('lines-reordered', {
    lineIds,
    sessionId
  });
  
  console.log(`✅ Lines reordered in session ${sessionId}`);
}

async function handleCompleteSession(
  socket: CollaborationSocket,
  data: { sessionId: string },
  collaborationService: CollaborationService
): Promise<void> {
  const { sessionId } = data;
  
  console.log(`🏁 Completing session ${sessionId}`);
  
  const context: Context = {
    userId: socket.data.userId || socket.id,
    sessionId,
    timestamp: new Date()
  };
  
  // Complete session through collaboration service
  const exportResult = await collaborationService.completeSessionRealtime(context, sessionId);
  
  // Broadcast to all participants in the session (including sender)
  socket.to(sessionId).emit('session-completed', {
    exportResult,
    sessionId
  });
  
  console.log(`✅ Session ${sessionId} completed and exported`);
}

async function handleDisconnect(
  socket: CollaborationSocket,
  reason: string,
  collaborationService: CollaborationService
): Promise<void> {
  const sessionId = socket.data.sessionId;
  const participantId = socket.data.participantId || socket.id;
  const participantName = socket.data.participantName || 'Unknown';
  
  console.log(`🔌 Client disconnected: ${socket.id} (${participantName}) - Reason: ${reason}`);
  
  if (sessionId) {
    const context: Context = {
      userId: socket.data.userId || socket.id,
      sessionId,
      timestamp: new Date()
    };
    
    try {
      // Leave session through collaboration service
      await collaborationService.leaveSession(context, sessionId, participantId);
      
      // Notify other participants
      socket.to(sessionId).emit('participant-left', {
        participantId,
        sessionId
      });
      
      console.log(`👋 ${participantName} automatically left session ${sessionId} due to disconnect`);
    } catch (error) {
      console.error('Error handling disconnect cleanup:', error);
    }
  }
}

// Helper function to create an event broadcaster for collaboration service
export function createEventBroadcaster(io: Server) {
  return async (sessionId: string, event: CollaborationEvent): Promise<void> => {
    io.to(sessionId).emit('collaboration-event', event);
    
    // Also emit specific events for better client handling
    switch (event.type) {
      case 'participant_joined':
        if (event.participant) {
          io.to(sessionId).emit('participant-joined', {
            participant: event.participant,
            sessionId
          });
        }
        break;
      case 'participant_left':
        if (event.participantId) {
          io.to(sessionId).emit('participant-left', {
            participantId: event.participantId,
            sessionId
          });
        }
        break;
      case 'song_line_added':
        if (event.songLine) {
          io.to(sessionId).emit('song-line-added', {
            songLine: event.songLine,
            sessionId
          });
        }
        break;
      case 'song_lines_reordered':
        if (event.lineIds) {
          io.to(sessionId).emit('lines-reordered', {
            lineIds: event.lineIds,
            sessionId
          });
        }
        break;
      case 'session_completed':
        if (event.exportResult) {
          io.to(sessionId).emit('session-completed', {
            exportResult: event.exportResult,
            sessionId
          });
        }
        break;
    }
  };
}