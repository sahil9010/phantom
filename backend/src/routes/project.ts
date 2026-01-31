import express from 'express';
import { createProject, getProjects, getProjectDetails, addMember, removeMember, deleteProject } from '../controllers/project';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createProject);
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectDetails);
router.post('/:id/members', authenticate, addMember);
router.delete('/:id/members/:userId', authenticate, removeMember);
router.delete('/:id', authenticate, deleteProject);

export default router;
