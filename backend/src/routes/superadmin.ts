import { Router } from 'express';
import { getAllCustomers, getSaaSStats, updateCustomerPayment } from '../controllers/superadmin';
import { authenticate, superAdminOnly } from '../middleware/auth';

const router = Router();

// All routes are protected and restricted to Super Admins
router.use(authenticate, superAdminOnly);

router.get('/customers', getAllCustomers);
router.get('/stats', getSaaSStats);
router.patch('/customers/:id/payment', updateCustomerPayment);

export default router;
