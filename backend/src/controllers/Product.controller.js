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


