const Category = require('../models/categoryModel');

const CategoryController = {
  // Create a new category
  async createCategory(req, res) {
    try {
      const { name, description, parentCategory, images, isActive } = req.body;
      const category = new Category({
        name,
        description,
        parentCategory,
        images,
        isActive
      });
      await category.save();
      res.status(201).json({ message: 'Category created successfully', category: { id: category._id, name, description, parentCategory, images, isActive } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find({}, { __v: 0 }).lean(); // Exclude __v field and convert to plain JavaScript objects
      const modifiedCategories = categories.map(category => ({ id: category._id, name: category.name, description: category.description, parentCategory: category.parentCategory||"", images: category.images, isActive: category.isActive }));
      res.json({categories:modifiedCategories});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a single category by ID
  async getCategoryById(req, res) {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId).lean(); // Convert to plain JavaScript object
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({category : { id: category._id, name: category.name, description: category.description, parentCategory: category.parentCategory||"", images: category.images, isActive: category.isActive }});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a category by ID
  async updateCategoryById(req, res) {
    try {
      const categoryId = req.params.id;
      const { name, description, parentCategory, images, isActive } = req.body;
      const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
        name,
        description,
        parentCategory,
        images,
        isActive
      }, { new: true });
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category updated successfully', category: { id: updatedCategory._id, name, description, parentCategory, images, isActive } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a category by ID
  async deleteCategoryById(req, res) {
    try {
      const categoryId = req.params.id;
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully', category: { id: deletedCategory._id, name: deletedCategory.name, description: deletedCategory.description, parentCategory: deletedCategory.parentCategory, images: deletedCategory.images, isActive: deletedCategory.isActive } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = CategoryController;
