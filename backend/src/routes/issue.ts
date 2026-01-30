import express from 'express';
import { createIssue, updateIssue, getProjectIssues, getIssueDetails } from '../controllers/issue';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createIssue);
router.patch('/:id', authenticate, updateIssue);
router.get('/:id', authenticate, getIssueDetails);
router.get('/project/:projectId', authenticate, getProjectIssues);

export default router;
