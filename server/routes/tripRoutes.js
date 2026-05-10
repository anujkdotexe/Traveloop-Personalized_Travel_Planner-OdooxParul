const express = require('express');
const router = express.Router();
const tc = require('../controllers/tripController');
const { verifyUser } = require('../middleware/auth');

// ─── Trips ──────────────────────────────────────────────────────────────────
router.get('/',           verifyUser, tc.getUserTrips);
router.post('/',          verifyUser, tc.createTrip);
router.get('/:id',        verifyUser, tc.getTripById);
router.put('/:id',        verifyUser, tc.updateTrip);
router.delete('/:id',     verifyUser, tc.deleteTrip);

// ─── Stops & Activities ──────────────────────────────────────────────────────
router.post('/stop',      verifyUser, tc.addStop);
router.post('/activity',  verifyUser, tc.addActivity);

// ─── Budget ──────────────────────────────────────────────────────────────────
router.get('/:id/budget', verifyUser, tc.getTripBudget);

// ─── Checklist ───────────────────────────────────────────────────────────────
router.get('/:id/checklist',              verifyUser, tc.getChecklist);
router.post('/checklist',                 verifyUser, tc.addChecklistItem);
router.patch('/checklist/:itemId/toggle', verifyUser, tc.toggleChecklistItem);

// ─── Notes ───────────────────────────────────────────────────────────────────
router.get('/:id/notes',       verifyUser, tc.getNotes);
router.post('/notes',          verifyUser, tc.addNote);
router.delete('/notes/:noteId', verifyUser, tc.deleteNote);

// ─── Community & Destinations ─────────────────────────────────────────────
router.get('/public/community', tc.getPublicTrips);
router.get('/public/top-destinations', tc.getTopDestinations);

module.exports = router;
