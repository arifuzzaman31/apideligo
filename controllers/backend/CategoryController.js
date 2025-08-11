import prisma from '../../lib/prisma.js';

export const createCategory = async (req, res) => {
    try {
      const { categoryName, icon, type='default' } = req.body;
      const cate = await prisma.Categories.create({
        data: {
          categoryName,
          icon,
          type,
          status: true,
        },
      });
  
      res.status(201).json({
        message: "Category created successfully",
        category: cate,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: "Category with this name already exists"
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
};
  
export const getAllCategories = async (req, res) => {
    try {
      const categories = await prisma.Categories.findMany({
        where: { status: true },
        orderBy: { createdAt: 'desc' },
      });
  
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
export const updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryName, icon, type } = req.body;
  
      const updatedCategory = await prisma.Categories.update({
        where: { id: parseInt(id) },
        data: {
          categoryName,
          icon,
          type,
        },
      });
  
      res.status(200).json({
        message: "Category updated successfully",
        category: updatedCategory,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
export const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Soft delete by updating status
      const deletedCategory = await prisma.Categories.update({
        where: { id: parseInt(id) },
        data: { status: false },
      });
  
      res.status(200).json({
        message: "Category deleted successfully",
        category: deletedCategory,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
export const getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const category = await prisma.Categories.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};