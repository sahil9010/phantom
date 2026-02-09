import express from 'express';
import { getChatHistory } from '../controllers/chat';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/:projectId', authenticate, getChatHistory);

export default router;
