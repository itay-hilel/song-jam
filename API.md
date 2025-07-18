# Song Jam API Documentation

## Base URL
```
http://localhost:3001/api
```

## Headers
- `Content-Type: application/json`
- `x-user-id: <optional-user-id>` - Optional user identification header

## Endpoints

### Health Check
**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T16:15:27.673Z",
  "version": "1.0.0"
}
```

### Session Management

#### Create Session
**POST** `/api/sessions`

Creates a new collaborative session.

**Request Body:**
```json
{
  "name": "My Awesome Session",     // Required
  "theme": "love",                  // Optional
  "style": "pop",                   // Optional
  "duration": 300                   // Optional, in seconds
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BOHGS6",
    "name": "My Awesome Session",
    "participants": [],
    "songLines": [],
    "status": "active",
    "theme": "love",
    "style": "pop",
    "createdAt": "2025-07-18T16:15:34.796Z",
    "updatedAt": "2025-07-18T16:15:34.796Z"
  },
  "message": "Session created successfully"
}
```

#### Get Session Details
**GET** `/api/sessions/:id`

Retrieves session information including participants and song lines.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BOHGS6",
    "name": "My Awesome Session",
    "participants": [...],
    "songLines": [...],
    "status": "active",
    "theme": "love",
    "style": "pop",
    "createdAt": "2025-07-18T16:15:34.796Z",
    "updatedAt": "2025-07-18T16:15:34.796Z"
  }
}
```

#### Join Session
**POST** `/api/sessions/:id/join`

Adds a participant to the session.

**Request Body:**
```json
{
  "participantName": "Alice"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": { /* updated session object */ },
    "participant": {
      "id": "participant_jnh8u9h70mr",
      "name": "Alice",
      "sessionId": "BOHGS6",
      "joinedAt": "2025-07-18T16:15:49.247Z"
    }
  },
  "message": "Alice joined the session successfully"
}
```

#### Add Song Line
**POST** `/api/sessions/:id/lines`

Generates and adds a new song line to the session using AI.

**Request Body:**
```json
{
  "prompt": "Write a love song line about the ocean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    /* updated session object with new song line */
  },
  "message": "Song line added successfully"
}
```

#### Reorder Song Lines
**PUT** `/api/sessions/:id/lines/reorder`

Reorders the song lines in the session.

**Request Body:**
```json
{
  "lineIds": ["line_nwte6zemzs", "line_q5rqyzdm02"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    /* updated session object with reordered lines */
  },
  "message": "Song lines reordered successfully"
}
```

#### Complete Session
**POST** `/api/sessions/:id/complete`

Completes the session and exports it to audio format.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Mock export completed for session BOHGS6",
    "url": "http://localhost:3000/mock-song-BOHGS6.mp3",
    "data": {
      "sessionId": "BOHGS6",
      "exportedAt": "2025-07-18T16:16:22.557Z",
      "format": "mp3",
      "duration": "3:45"
    }
  },
  "message": "Session completed and exported successfully"
}
```

## Error Responses

### Validation Error
```json
{
  "error": "Validation failed",
  "details": ["Missing required field: name"]
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Session not found",
  "message": "No session found with ID: nonexistent"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to create session",
  "message": "Internal server error"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Session Status Values

- `active` - Session is currently active and accepting participants/lines
- `completed` - Session has been completed and exported
- `archived` - Session has been archived

## Example Usage with curl

```bash
# Create a session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name": "Beach Vibes", "theme": "summer", "style": "reggae"}'

# Join the session
curl -X POST http://localhost:3001/api/sessions/SESSIONID/join \
  -H "Content-Type: application/json" \
  -d '{"participantName": "Bob"}'

# Add a song line
curl -X POST http://localhost:3001/api/sessions/SESSIONID/lines \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write about waves crashing on the shore"}'

# Complete the session
curl -X POST http://localhost:3001/api/sessions/SESSIONID/complete
```
