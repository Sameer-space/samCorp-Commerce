
const stripeService = require('./stripeService');
const paypalService = require('./paypalService');
const googlePayService = require('./googlePayService');
const paytmService = require('./paytmService');

const PaymentService = {
  processPayment: async (gateway, orderId) => {
    let paymentResult;

    // Call the appropriate payment service based on the specified gateway
    switch (gateway) {
      case 'stripe':
        paymentResult = await stripeService.processPayment(orderId);
        break;
      case 'paypal':
        paymentResult = await paypalService.processPayment(orderId);
        break;
      case 'googlepay':
        paymentResult = await googlePayService.processPayment(orderId);
        break;
      case 'paytm':
        paymentResult = await paytmService.processPayment(orderId);
        break;
      default:
        throw new Error('Invalid payment gateway');
    }

    return paymentResult;
  },
};

module.exports = PaymentService;
