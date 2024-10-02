const express = require('express');
const router = express.Router();
const dayOffCtrl = require('../controllers/dayOffCtrl');
const { isAuth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/role');


router.post('/dayoff', isAuth,  dayOffCtrl.requestDayOff);
router.get('/dayoff', isAuth,  dayOffCtrl.getAllDayOffRequests);
router.get('/dayoff/:requestId', isAuth,  dayOffCtrl.getDayOffRequestById);
router.put('/dayoff/:requestId', isAuth,  dayOffCtrl.updateDayOffRequest);
router.delete('/dayoff/:requestId', isAuth,  dayOffCtrl.deleteDayOffRequest);
router.put('/dayoffstat/:id', isAuth,  checkRole('Admin'), dayOffCtrl.updateDayOffRequestStatus);
router.put('/dayoff', isAuth,  checkRole('Admin'), dayOffCtrl.getAllDayOffRequests);
module.exports = router;
