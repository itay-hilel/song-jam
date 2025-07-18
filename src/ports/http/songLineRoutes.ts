import { Router } from 'express';
import { SongLineService } from '../../application/songLine/songLineService';
import { SongLine } from '../../domain/songLine/songLineModel';

const router = Router();
const songLineService = new SongLineService();

// Create a new song line
router.post('/', async (req, res) => {
    const { sessionId, line } = req.body;
    try {
        const newSongLine = await songLineService.addSongLine(req.context, sessionId, line);
        res.status(201).json(newSongLine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all song lines for a session
router.get('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const songLines = await songLineService.getSongLines(req.context, sessionId);
        res.status(200).json(songLines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a song line
router.put('/:lineId', async (req, res) => {
    const { lineId } = req.params;
    const { line } = req.body;
    try {
        const updatedSongLine = await songLineService.updateSongLine(req.context, lineId, line);
        res.status(200).json(updatedSongLine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a song line
router.delete('/:lineId', async (req, res) => {
    const { lineId } = req.params;
    try {
        await songLineService.deleteSongLine(req.context, lineId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;