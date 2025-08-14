const Product = require('../models/Product');
const Category = require('../models/Category');

const mapProduct = (p, categoryName = '') => ({
  id: p._id,
  name: p.name,
  category: categoryName,
  oldPrice: p.old_price,
  price: p.current_price,
  discount: p.discount,
  description: p.description,
  images: (p.images || []).map(i => i.url),
  variants: (p.variants || []).map(v => ({
    id: v._id, name: v.name, price: v.price, inStock: v.in_stock, color: v.color, type: v.type
  })),
  specifications: p.specifications,
  rating: p.rating,
  reviewCount: p.review_count,
  inStock: p.in_stock,
  newArrival: p.new_arrival,
  type: p.tags ? p.tags.split(',').map(s => s.trim()) : []
});

exports.create = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      category,
      oldPrice,
      discount,
      description,
      images,
      variants,
      specifications,
      inStock,
      careInstructions,
      newArrival,
      tags
    } = req.body || {};

    if (!name || (oldPrice === undefined || oldPrice === null) || (!categoryId && !category)) {
      return res.status(400).json({ message: 'Thiếu trường bắt buộc: name, oldPrice, categoryId/category' });
    }

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') }).select('_id');
      if (!cat) return res.status(400).json({ message: 'Category không tồn tại' });
      resolvedCategoryId = cat._id;
    }

    const normalizedImages = Array.isArray(images)
      ? images.map(i => typeof i === 'string' ? { url: i } : { url: i.url, is_primary: !!i.is_primary })
      : [];

    const normalizedVariants = Array.isArray(variants)
      ? variants.map(v => ({
          name: v.name,
          price: Number(v.price) || 0,
          in_stock: v.in_stock !== undefined ? Number(v.in_stock) : Number(v.inStock || 0),
          color: v.color,
          type: v.type
        }))
      : [];

    const productDoc = {
      name,
      category_id: resolvedCategoryId,
      old_price: Number(oldPrice),
      discount: discount !== undefined ? Number(discount) : 0,
      description,
      images: normalizedImages,
      variants: normalizedVariants,
      specifications: specifications && typeof specifications === 'object' ? specifications : undefined,
      in_stock: inStock !== undefined ? !!inStock : undefined,
      care_instructions: careInstructions,
      new_arrival: !!newArrival,
      tags: Array.isArray(tags) ? tags.join(',') : tags
    };

    const created = await Product.create(productDoc);
    return res.status(201).json(mapProduct(created));
  } catch (e) {
    console.error('Create product error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { category, q, _limit, page } = req.query;
    const filter = {};
    let categoryName = '';
    if (category) {
      const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') }).select('_id name');
      if (!cat) return res.json([]);
      filter.category_id = cat._id;
      categoryName = cat.name;
    }
    if (q) filter.name = { $regex: q, $options: 'i' };

    const limit = Number(_limit) || 20;
    const skip = Math.max(0, (Number(page) - 1) * limit || 0);

    const items = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json(items.map(p => mapProduct(p, categoryName)));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(mapProduct(p));
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
};

exports.bestSellers = async (_req, res) => {
  try {
    const items = await Product.find().sort({ review_count: -1, rating: -1 }).limit(12);
    res.json(items.map(mapProduct));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.promotions = async (_req, res) => {
  try {
    const items = await Product.find({ discount: { $gt: 0 } }).sort({ discount: -1 }).limit(12);
    res.json(items.map(mapProduct));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.newArrival = async (_req, res) => {
  try {
    const items = await Product.find({ new_arrival: true }).sort({ createdAt: -1 }).limit(12);
    res.json(items.map(mapProduct));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.categories = async (_req, res) => {
  try {
    const agg = await Product.aggregate([
      { $group: { _id: '$category_id', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $project: { name: '$cat.name', count: 1, _id: 0 } },
      { $sort: { count: -1, name: 1 } }
    ]);
    res.json(agg);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.update = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      category,
      oldPrice,
      discount,
      description,
      images,
      variants,
      specifications,
      inStock,
      careInstructions,
      newArrival,
      tags
    } = req.body || {};

    const updateDoc = {};

    if (name !== undefined) updateDoc.name = name;
    if (oldPrice !== undefined) updateDoc.old_price = Number(oldPrice);
    if (discount !== undefined) updateDoc.discount = Number(discount);
    if (description !== undefined) updateDoc.description = description;
    if (inStock !== undefined) updateDoc.in_stock = !!inStock;
    if (careInstructions !== undefined) updateDoc.care_instructions = careInstructions;
    if (newArrival !== undefined) updateDoc.new_arrival = !!newArrival;
    if (tags !== undefined) updateDoc.tags = Array.isArray(tags) ? tags.join(',') : tags;

    if (images !== undefined) {
      updateDoc.images = Array.isArray(images)
        ? images.map(i => typeof i === 'string' ? { url: i } : { url: i.url, is_primary: !!i.is_primary })
        : [];
    }

    if (variants !== undefined) {
      updateDoc.variants = Array.isArray(variants)
        ? variants.map(v => ({
            name: v.name,
            price: Number(v.price) || 0,
            in_stock: v.in_stock !== undefined ? Number(v.in_stock) : Number(v.inStock || 0),
            color: v.color,
            type: v.type
          }))
        : [];
    }

    if (specifications !== undefined) {
      updateDoc.specifications = specifications && typeof specifications === 'object' ? specifications : undefined;
    }

    if (categoryId || category) {
      let resolvedCategoryId = categoryId;
      if (!resolvedCategoryId && category) {
        const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') }).select('_id');
        if (!cat) return res.status(400).json({ message: 'Category không tồn tại' });
        resolvedCategoryId = cat._id;
      }
      updateDoc.category_id = resolvedCategoryId;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateDoc },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Not found' });

    let categoryName = '';
    if (updated.category_id) {
      const cat = await Category.findById(updated.category_id).select('name');
      categoryName = cat ? cat.name : '';
    }

    return res.json(mapProduct(updated, categoryName));
  } catch (e) {
    console.error('Update product error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.json({ success: true });
  } catch (e) {
    console.error('Delete product error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};


