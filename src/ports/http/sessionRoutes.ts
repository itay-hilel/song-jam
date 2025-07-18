import { Router, Request, Response } from 'express';
import { SessionService } from '../../application/session/sessionService';
import { Session } from '../../domain/session/sessionModel';
import { Application } from '../../preset/presetTypes';
import { Context, CreateSessionPayload } from '../../types';
import { buildParticipantEntity } from '../../domain/participant/participantModel';
import { 
  contextMiddleware, 
  validateRequest, 
  validateSessionId 
} from './middleware';

export function createSessionRoutes(app: Application): Router {
  const router = Router();
  const sessionService = app.sessionService;

  // Apply context middleware to all routes
  router.use(contextMiddleware);

  /**
   * POST /api/sessions - Create a new session
   */
  router.post('/', 
    validateRequest(['name']),
    async (req: Request, res: Response) => {
      try {
        const payload: CreateSessionPayload = {
          name: req.body.name,
          theme: req.body.theme,
          style: req.body.style,
          duration: req.body.duration
        };

        const session = await sessionService.create(req.context, payload);
        
        res.status(201).json({
          success: true,
          data: session,
          message: 'Session created successfully'
        });
      } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create session',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * GET /api/sessions/:id - Get session details
   */
  router.get('/:id',
    validateSessionId,
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.id;
        const session = await sessionService.getSession(req.context, sessionId);
        
        if (!session) {
          res.status(404).json({
            success: false,
            error: 'Session not found',
            message: `No session found with ID: ${sessionId}`
          });
          return;
        }

        res.json({
          success: true,
          data: session
        });
      } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get session',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * POST /api/sessions/:id/join - Join a session
   */
  router.post('/:id/join',
    validateSessionId,
    validateRequest(['participantName']),
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.id;
        const participantName = req.body.participantName;
        
        // Create participant entity
        const participant = buildParticipantEntity({
          name: participantName,
          sessionId: sessionId
        });

        const session = await sessionService.join(req.context, sessionId, participant);
        
        res.json({
          success: true,
          data: {
            session,
            participant
          },
          message: `${participantName} joined the session successfully`
        });
      } catch (error) {
        console.error('Error joining session:', error);
        
        if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Session not found',
            message: error.message
          });
          return;
        }

        res.status(500).json({
          success: false,
          error: 'Failed to join session',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * POST /api/sessions/:id/lines - Add a song line
   */
  router.post('/:id/lines',
    validateSessionId,
    validateRequest(['prompt']),
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.id;
        const prompt = req.body.prompt;
        
        const session = await sessionService.addSongLine(req.context, sessionId, prompt);
        
        res.json({
          success: true,
          data: session,
          message: 'Song line added successfully'
        });
      } catch (error) {
        console.error('Error adding song line:', error);
        
        if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Session not found',
            message: error.message
          });
          return;
        }

        res.status(500).json({
          success: false,
          error: 'Failed to add song line',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * PUT /api/sessions/:id/lines/reorder - Reorder song lines
   */
  router.put('/:id/lines/reorder',
    validateSessionId,
    validateRequest(['lineIds']),
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.id;
        const lineIds = req.body.lineIds;
        
        // Validate that lineIds is an array
        if (!Array.isArray(lineIds)) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'lineIds must be an array'
          });
          return;
        }

        const session = await sessionService.reorderLines(req.context, sessionId, lineIds);
        
        res.json({
          success: true,
          data: session,
          message: 'Song lines reordered successfully'
        });
      } catch (error) {
        console.error('Error reordering lines:', error);
        
        if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Session not found',
            message: error.message
          });
          return;
        }

        res.status(500).json({
          success: false,
          error: 'Failed to reorder lines',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * POST /api/sessions/:id/complete - Complete session and export
   */
  router.post('/:id/complete',
    validateSessionId,
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.id;
        
        // Export the session
        const exportResult = await sessionService.exportToSono(req.context, sessionId);
        
        res.json({
          success: true,
          data: exportResult,
          message: 'Session completed and exported successfully'
        });
      } catch (error) {
        console.error('Error completing session:', error);
        
        if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Session not found',
            message: error.message
          });
          return;
        }

        res.status(500).json({
          success: false,
          error: 'Failed to complete session',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  return router;
}