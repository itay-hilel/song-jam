export function registerCollaborationHandlers(config: WebSocketConfig) {
  const { io, service } = config;
  
  io.on('connection', (socket) => {
    socket.on('join-session', async (sessionId) => {
      socket.join(sessionId);
      const participants = await service.getParticipants(sessionId);
      io.to(sessionId).emit('participants-updated', participants);
    });
    
    socket.on('add-song-line', async (data) => {
      const result = await service.addSongLine(data.sessionId, data.line);
      io.to(data.sessionId).emit('line-added', result);
    });
    
    socket.on('reorder-lines', async (data) => {
      const result = await service.reorderLines(data.sessionId, data.lineIds);
      io.to(data.sessionId).emit('lines-reordered', result);
    });
    
    socket.on('disconnect', () => {
      // Handle disconnection logic if needed
    });
  });
}