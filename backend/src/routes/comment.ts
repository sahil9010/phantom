import express from 'express';
import { createComment, updateComment, deleteComment } from '../controllers/comment';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createComment);
router.patch('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
