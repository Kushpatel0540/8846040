// app.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Product details (you can change these as per your online store)
const products = [
  { id: 1, name: 'Dark Chocolate', price: 3.99 },
  { id: 2, name: 'White Milk Chocolate', price: 4.99 }
];

// Homepage with the web form
app.get('/', (req, res) => {
  res.render('index', { products });
});

// Form validation and receipt generation
app.post(
  '/checkout',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('province').notEmpty().withMessage('Province is required'),
    body('phone').isNumeric().withMessage('Phone number should be numeric').isLength({ min: 10 }).withMessage('Invalid phone number'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('product1').isInt({ min: 0 }).withMessage('Quantity should be a positive integer'),
    body('product2').isInt({ min: 0 }).withMessage('Quantity should be a positive integer')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, re-render the form with the errors
      return res.render('index', { errors: errors.array(), products });
    }

    // Calculate total amount
    const { product1, product2 } = req.body;
    const totalAmount = (products[0].price * parseInt(product1)) + (products[1].price * parseInt(product2));

    if (totalAmount < 10) {
      // If total amount is less than $10, display an error message
      return res.render('index', { errors: [{ msg: 'Minimum purchase should be $10' }], products });
    }

    // Calculate sales tax based on the selected province (you can add more tax rates for other provinces)
    const province = req.body.province;
    const salesTaxRateByProvince = {
      'AB': 0.05, // Alberta
      'BC': 0.12, // British Columbia
      // Add more tax rates for other provinces
    };
    const salesTaxRate = salesTaxRateByProvince[province] || 0;
    const salesTax = totalAmount * salesTaxRate;

    // Receipt data
    const receiptData = {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      province: req.body.province,
      phone: req.body.phone,
      email: req.body.email,
      product1: products[0].name,
      product1Quantity: parseInt(product1),
      product1Price: products[0].price,
      product2: products[1].name,
      product2Quantity: parseInt(product2),
      product2Price: products[1].price,
      totalAmount,
      salesTax
    };

    // Render the receipt template with the receipt data
    res.render('receipt', { receiptData });
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
