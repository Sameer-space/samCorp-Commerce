const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require( '../controllers/productController');

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET a single category by ID
router.get('/:id', categoryController.getCategoryById);

// POST a new category
router.post('/', categoryController.createCategory);

// PUT update a category by ID
router.put('/:id', categoryController.updateCategoryById);

// DELETE a category by ID
router.delete('/:id', categoryController.deleteCategoryById);

 // GET products by category
 router.get('/:categoryId/products', productController.getProductsByCategory);

module.exports = router;
