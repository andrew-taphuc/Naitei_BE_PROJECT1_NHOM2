const Wishlist = require('../models/Wishlist');

exports.add = async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });
    await Wishlist.create({ product_id: productId });
    res.json({ message: 'Đã thêm vào danh sách yêu thích' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};


