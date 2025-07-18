import { Router } from 'express';
import { SessionService } from '../../application/session/sessionService';
import { Session } from '../../domain/session/sessionModel';

const router = Router();
const sessionService: SessionService = /* initialize your session service here */;

// Create a new session
router.post('/', async (req, res) => {
    try {
        const sessionData: Session = req.body;
        const newSession = await sessionService.create(req.context, sessionData);
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ message: 'Error creating session', error });
    }
});

// Join an existing session
router.post('/:sessionId/join', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const participant = req.body; // Assuming participant data is sent in the request body
        const updatedSession = await sessionService.join(req.context, sessionId, participant);
        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: 'Error joining session', error });
    }
});

// Add a song line to a session
router.post('/:sessionId/song-line', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const line = req.body; // Assuming line data is sent in the request body
        const updatedSession = await sessionService.addSongLine(req.context, sessionId, line);
        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: 'Error adding song line', error });
    }
});

// Reorder song lines in a session
router.put('/:sessionId/song-lines/reorder', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const lineIds = req.body.lineIds; // Assuming line IDs are sent in the request body
        const updatedSession = await sessionService.reorderLines(req.context, sessionId, lineIds);
        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: 'Error reordering song lines', error });
    }
});

// Export session to Sono API
router.post('/:sessionId/export', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const exportResult = await sessionService.exportToSono(req.context, sessionId);
        res.status(200).json(exportResult);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting session', error });
    }
});

export default router;