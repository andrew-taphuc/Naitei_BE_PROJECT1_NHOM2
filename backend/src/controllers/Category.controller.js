const Category = require("../models/Category");
const { objectIdToInt } = require("../utils/helpers");

// Mapping function to match frontend JSON server format
const mapCategoryToJSONServerFormat = (category) => {
  return {
    id: objectIdToInt(category._id),
    name: category.name,
  };
};

// Get all categories (for json-server compatibility)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    const mappedCategories = categories.map(mapCategoryToJSONServerFormat);
    res.json(mappedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
