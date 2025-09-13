const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const hasRole = require('../middleware/role');

router.get('/:slug/members', authMiddleware, hasRole('admin'), userController.getUsersInTenant);
router.put('/:userId/role', authMiddleware, hasRole('admin'), userController.updateUserRole);
router.put('/:userId/upgrade-plan', authMiddleware, hasRole('admin'), userController.upgradeUserPlan);

module.exports = router;