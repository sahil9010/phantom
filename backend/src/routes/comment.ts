import express from 'express';
import { createComment } from '../controllers/comment';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createComment);

export default router;
