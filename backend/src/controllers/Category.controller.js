
const Category = require('../models/Category');

const mapCategory = (c) => ({ id: c._id, name: c.name, type: c.type });

exports.list = async (_req, res) => {
  try {
    const items = await Category.find().sort({ name: 1 }).select('_id name type');
    return res.json(items.map(mapCategory));
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, type } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' });

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') }).select('_id');
    if (existing) return res.status(409).json({ message: 'Danh mục đã tồn tại' });

    const created = await Category.create({ name, type: type || 'product' });
    return res.status(201).json(mapCategory(created));
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};



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
