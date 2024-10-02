const express = require('express');
const router = express.Router();
const tippingCtrl = require('../controllers/tippingCtrl');
const { isAuth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/role');


router.post('/tipping', isAuth,  tippingCtrl.createTippingRequest);
router.get('/tipping/all', isAuth, tippingCtrl.getAllTippingRequestsForUser);
router.get('/tipping/:id', isAuth, tippingCtrl.getTippingRequestById);
router.put('/tipping/:id', isAuth, tippingCtrl.updateTippingRequest);
router.delete('/tipping/:id', isAuth, tippingCtrl.deleteTippingRequest);
router.get('/tipping', isAuth, checkRole('Admin'), tippingCtrl.getAllTippingRequestsForAdmin);
router.put('/tipping/admin/:id', isAuth, checkRole('Admin'), tippingCtrl.updateTippingRequestStatus);
module.exports = router;
