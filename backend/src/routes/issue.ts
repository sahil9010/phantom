import express from 'express';
import { createIssue, updateIssue, getProjectIssues, getIssueDetails, reorderIssues } from '../controllers/issue';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createIssue);
router.post('/reorder', authenticate, reorderIssues);
router.patch('/:id', authenticate, updateIssue);
router.get('/:id', authenticate, getIssueDetails);
router.get('/project/:projectId', authenticate, getProjectIssues);

export default router;
