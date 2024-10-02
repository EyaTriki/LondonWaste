const express = require('express');
const router = express.Router();
const PayrollCtrl = require('../controllers/payrollCtrl');
const { isAuth } = require('../middlewares/auth'); 
const { checkRole } = require('../middlewares/role'); 


router.post('/payrolls/start', isAuth, PayrollCtrl.logStartTime);
router.post('/payrolls/end', isAuth, PayrollCtrl.logEndTime);
router.get('/payrolls/total', isAuth, PayrollCtrl.getTotalWorkedHoursAndSalaryForUser);
router.get('/payrolls', isAuth, PayrollCtrl.getIndividualPayrollRecords);
router.put('/payrolls/:payrollId', isAuth, PayrollCtrl.updatePayrollRecord);
router.delete('/payrolls/:payrollId', isAuth,checkRole('Admin'), PayrollCtrl.deletePayroll);
router.get('/payroll/all-users', isAuth, checkRole('Admin'), PayrollCtrl.getAllWorkedHoursAndSalaryForAllUsers);
router.get('/payrolls/all', isAuth,checkRole('Admin'), PayrollCtrl.getAllPayrolls);
router.get('/payrolls/:userId', isAuth,checkRole('Admin'), PayrollCtrl.getPayrollsByUserId);
router.put('/payrolls/admin/:payrollId', isAuth,checkRole('Admin'), PayrollCtrl.updatePayrollAdmin);
//router.put('/payrolls/admin/:payrollId', isAuth,checkRole('Admin'), PayrollCtrl.updatePayrollAdmin);
router.delete('/payrolls/reset/:userId', isAuth,checkRole('Admin'), PayrollCtrl.resetPayroll);

module.exports = router;
