import prisma from '../../lib/prisma.js';
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