const Product = require('../models/productModel');
const verifyAdminToken = require('../middlewares/adminAuthMiddleware');


const ProductController = {
	// Create a new product
	async createProduct(req, res) {
		try {
			// Check if the request is coming from an authenticated admin
			const adminToken = req.headers.authorization;
			if (!adminToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}
			verifyAdminToken(adminToken);

			const {
				name,
				description,
				images,
				category,
				variants,
				isActive
			} = req.body;
			if (!name || !description || !images || !variants || !isActive) {
				return res.status(400).json({
					error: 'Missing required fields in the request body'
				});
			}

			const product = new Product({
				name,
				description,
				images,
				category,
				variants,
				isActive
			});
			await product.save();
			const modifiedProduct = {
				id: product._id, // Map _id to id
				name: product.name,
				description: product.description,
				images: product.images,
				categoryId: product.category || "",
				variants: product.variants.map(variant => ({
					id: variant._id, // Map _id to id
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: product.isActive,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt
			};
			res.status(201).json({
				message: 'Product created successfully',
				product: modifiedProduct
			});
		} catch (error) {
			if (error.message === 'Invalid token') {
				return res.status(401).json({
					error: 'Invalid token'
				});
			}
			if (error.message === 'Token expired') {
				return res.status(401).json({
					error: 'Token expired'
				});
			}
			if (error.message === 'Unauthorized access') {
				return res.status(401).json({
					error: 'Unauthorized access'
				});
			}
			return res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

  // Get all products
	async getAllProducts(req, res) {
		try {
			const products = await Product.find({}, {
				__v: 0
			}); // Exclude __v field
			const modifiedProducts = products.map(product => ({
				id: product._id, // Map _id to id
				name: product.name,
				description: product.description,
				images: product.images,
				categoryId: product.category || "",
				variants: product.variants.map(variant => ({
					id: variant._id, // Map _id to id
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: product.isActive,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt
			}));
			res.json({
				products: modifiedProducts
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	// Get a single product by ID
	async getProductById(req, res) {
		try {
			const productId = req.params.id;
			const product = await Product.findById(productId);
			if (!product) {
				return res.status(404).json({
					error: 'Product not found'
				});
			}
			const modifiedProduct = {
				id: product._id, // Map _id to id
				name: product.name,
				description: product.description,
				images: product.images,
				categoryId: product.category || "",
				variants: product.variants.map(variant => ({
					id: variant._id, // Map _id to id
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: product.isActive,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt
			};
			res.json({
				product: modifiedProduct
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	// Update a product by ID
	async updateProductById(req, res) {
		try {
			const productId = req.params.id;
			const {
				name,
				description,
				images,
				category,
				variants,
				isActive
			} = req.body;
			const updatedProduct = await Product.findByIdAndUpdate(productId, {
				name,
				description,
				images,
				category,
				variants,
				isActive
			}, {
				new: true
			});
			if (!updatedProduct) {
				return res.status(404).json({
					error: 'Product not found'
				});
			}
			const modifiedProduct = {
				id: updatedProduct._id, // Map _id to id
				name: updatedProduct.name,
				description: updatedProduct.description,
				images: updatedProduct.images,
				categoryId: updatedProduct.category || "",
				variants: updatedProduct.variants.map(variant => ({
					id: variant._id, // Map _id to id
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: updatedProduct.isActive,
				createdAt: updatedProduct.createdAt,
				updatedAt: updatedProduct.updatedAt
			};
			res.json({
				message: 'Product updated successfully',
				product: modifiedProduct
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	// Delete a product by ID
	async deleteProductById(req, res) {
		try {
			const productId = req.params.id;
			const deletedProduct = await Product.findByIdAndDelete(productId);
			if (!deletedProduct) {
				return res.status(404).json({
					error: 'Product not found'
				});
			}
			const modifiedProduct = {
				id: deletedProduct._id, // Map _id to id
				name: deletedProduct.name,
				description: deletedProduct.description,
				images: deletedProduct.images,
				categoryId: deletedProduct.category || "",
				variants: deletedProduct.variants.map(variant => ({
					id: variant._id, // Map _id to id
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: deletedProduct.isActive,
				createdAt: deletedProduct.createdAt,
				updatedAt: deletedProduct.updatedAt
			};
			res.json({
				message: 'Product deleted successfully',
				product: modifiedProduct
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	// Get products by category
	async getProductsByCategory(req, res) {
		try {
			const categoryId = req.params.categoryId; // Assuming categoryId is passed in the request parameters
			const products = await Product.find({
				category: categoryId
			});

			// Map _id to id and remove __v field
			const modifiedProducts = products.map(product => ({
				id: product._id,
				name: product.name,
				description: product.description,
				images: product.images,
				category: product.category || "",
				variants: product.variants.map(variant => ({
					id: variant._id,
					name: variant.name,
					price: variant.price,
					stockQuantity: variant.stockQuantity,
					attributes: variant.attributes,
					images: variant.images
				})),
				isActive: product.isActive,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt
			}));

			res.json({
				products: modifiedProducts
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	}
};



module.exports = ProductController;