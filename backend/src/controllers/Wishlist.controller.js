const Wishlist = require('../models/Wishlist');

exports.list = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await Wishlist.aggregate([
      { $match: { user_id: require('mongoose').Types.ObjectId.createFromHexString(String(userId)) } },
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $sort: { created_at: -1 } },
    ]);

    const mapped = items.map((it) => ({
      id: it.product._id,
      name: it.product.name,
      oldPrice: it.product.old_price,
      discount: it.product.discount,
      images: (it.product.images || []).map(i => i.url),
      description: it.product.description || '',
      category: '',
      rating: it.product.rating || 0,
      inStock: it.product.in_stock,
      specifications: it.product.specifications,
      newArival: it.product.new_arrival,
      type: it.product.tags ? String(it.product.tags).split(',').map(s => s.trim()) : []
    }));

    return res.json(mapped);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.add = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body || {};
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });
    await Wishlist.updateOne(
      { user_id: userId, product_id: productId },
      { $setOnInsert: { user_id: userId, product_id: productId } },
      { upsert: true }
    );
    res.json({ message: 'Đã thêm vào danh sách yêu thích' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });
    await Wishlist.findOneAndDelete({ user_id: userId, product_id: productId });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};


