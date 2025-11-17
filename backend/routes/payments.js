// backend/routes/payments.js
import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const routerPayment = express.Router();
const paymentController = new PaymentController();

// MoMo
routerPayment.post('/momo_create', protect, (req, res) => paymentController.createMomoPayment(req, res));
routerPayment.post('/momo_ipn', (req, res) => paymentController.momoIPN(req, res)); // IPN không cần protect

export default routerPayment;