import express from 'express';
import { createProject, getProjects, getProjectDetails } from '../controllers/project';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createProject);
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectDetails);

export default router;
