# Song Jam

## Overview
Song Jam is a real-time, collaborative music creation platform that allows users to transform spontaneous creative inputs into cohesive songs through AI-powered assistance and group collaboration. The platform is designed to democratize music creation, enabling anyone to contribute to songwriting regardless of their musical experience.

## Features
- **Real-time Collaboration**: Users can join jam sessions and collaborate in real-time using voice or text inputs.
- **AI-Powered Song Generation**: The platform utilizes advanced language models to process inputs and generate song components.
- **Collaborative Canvas**: A shared workspace where participants can see and modify the evolving song structure.
- **Session Recording & Export**: Automatic recording of sessions with options to export the final song in various formats.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL (for production setup)
- OpenAI API key (for LLM integration)
- Sono API key (for song generation)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd song-jam
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Build the project:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

The server will start on `http://localhost:3001` by default.

## Week 2 Progress: HTTP Routes ✅

We have successfully implemented a complete REST API for session management with the following endpoints:

### API Endpoints
- **POST** `/api/sessions` - Create new session
- **GET** `/api/sessions/:id` - Get session details  
- **POST** `/api/sessions/:id/join` - Join session
- **POST** `/api/sessions/:id/lines` - Add song line
- **PUT** `/api/sessions/:id/lines/reorder` - Reorder lines
- **POST** `/api/sessions/:id/complete` - Complete and export
- **GET** `/health` - Health check

### Key Features Implemented
- ✅ Express.js server with TypeScript
- ✅ Request validation middleware
- ✅ Context management for user sessions
- ✅ Comprehensive error handling
- ✅ JSON API responses with consistent format
- ✅ Session CRUD operations
- ✅ Participant management
- ✅ AI-powered song line generation
- ✅ Song line reordering functionality
- ✅ Export integration

### Files Created/Modified
- `src/ports/http/middleware.ts` - Request validation and context
- `src/ports/http/sessionRoutes.ts` - Session CRUD operations
- `src/entrypoint/server.ts` - Express app setup

### Testing
All endpoints have been tested and are working correctly:
```bash
# Test the API
curl -X GET http://localhost:3001/health
curl -X POST http://localhost:3001/api/sessions -H "Content-Type: application/json" -d '{"name": "Test Session"}'
```

See `API.md` for complete API documentation.

## Day 10-11 Progress: WebSocket Integration ✅

We have successfully implemented comprehensive real-time collaboration via WebSocket!

### WebSocket Features Implemented
- ✅ Socket.IO server integrated with HTTP server
- ✅ Real-time session collaboration
- ✅ Participant join/leave notifications
- ✅ Live song line addition and sharing
- ✅ Real-time line reordering
- ✅ Session completion broadcasting
- ✅ Comprehensive error handling
- ✅ Session room management

### WebSocket Events
- **Client → Server:** `join-session`, `leave-session`, `add-song-line`, `reorder-lines`, `complete-session`
- **Server → Client:** `participant-joined`, `participant-left`, `song-line-added`, `lines-reordered`, `session-completed`, `session-updated`

### WebSocket Endpoints
- **WebSocket Server:** `ws://localhost:3001`
- **Status Endpoint:** `GET /websocket/status` - WebSocket connection metrics
- **Enhanced Health:** `GET /health` - Server + WebSocket status

### Files Created/Modified
- `src/application/collaboration/collaborationService.ts` - Enhanced real-time collaboration
- `src/ports/websocket/collaborationHandlers.ts` - WebSocket event handlers
- `src/entrypoint/server.ts` - Integrated WebSocket server

### Testing
```bash
# Test WebSocket connection
node simple-websocket-test.js

# Full integration test
node test-websocket.js

# Multi-client test
node test-websocket.js multi
```

See `WEBSOCKET.md` for complete WebSocket API documentation.

## Current Architecture

The Song Jam backend now supports:
- ✅ **Week 1:** Core backend architecture with clean architecture
- ✅ **Week 2:** HTTP REST API for session management  
- ✅ **Day 10-11:** Real-time WebSocket collaboration

**Ready for frontend integration and production deployment!** 🚀

## Directory Structure
```
song-jam/
├── src/
│   ├── domain/
│   ├── application/
│   ├── strategy/
│   ├── infrastructure/
│   ├── ports/
│   ├── preset/
│   ├── entrypoint/
│   └── client/
├── package.json
├── tsconfig.json
├── .env.template
└── README.md
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.