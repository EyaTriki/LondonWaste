const express = require('express');
const router = express.Router();
const driverCtrl = require('../controllers/driverCtrl');
const { isAuth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/role');
const multer = require('../middlewares/multer');


router.get('/driver', isAuth, driverCtrl.getTasksForDriver);
router.post('/trucks/start/:truckId', isAuth, multer.array('uploads'), driverCtrl.updateTruckStart);
router.put('/driver', isAuth, multer.single('picture'), driverCtrl.updateDriverProfile);

router.post('/trucks/end/:truckId', isAuth, multer.array('uploads'), driverCtrl.updateTruckEnd);
router.put('/tasks/update-status/:taskId', isAuth, driverCtrl.updateJobStatus);
router.put('/tasks/rate/:taskId', isAuth, driverCtrl.rateTask);


router.post('/location/uploadItem/:taskId', isAuth, multer.array('uploads'), driverCtrl.uploadInitialConditionPhotos);
router.post('/truck/uploadItem/:taskId', isAuth, multer.array('uploads'), driverCtrl.uploadFinalConditionPhotos);
router.post('/additional-items/uploadItem/:taskId', isAuth, multer.array('uploads'), driverCtrl.addAdditionalItems);

module.exports = router;