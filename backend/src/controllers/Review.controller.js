const Review = require('../models/Review');
const Product = require('../models/Product');
const { v4: uuid } = require('uuid');

exports.listByProduct = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.json([]);
    const list = await Review.find({ product_id: productId }).sort({ created_at: -1 });
    res.json(list.map(r => ({
      id: r._id,
      productId: r.product_id,
      rating: r.rating,
      comment: r.comment,
      userId: r.user_id,
      userName: r.user_name,
      createdAt: r.created_at
    })));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  try {
    const { productId, rating, comment, userId, userName } = req.body || {};
    if (!productId || !rating || !userId || !userName) return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const review = await Review.create({
      _id: uuid(),
      product_id: productId,
      rating,
      comment: comment || '',
      user_id: userId,
      user_name: userName
    });

    const stats = await Review.aggregate([
      { $match: { product_id: review.product_id } },
      { $group: { _id: '$product_id', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
    ]);
    if (stats[0]) {
      await Product.findByIdAndUpdate(review.product_id, {
        $set: { rating: Math.round(stats[0].avg * 10) / 10, review_count: stats[0].cnt }
      });
    }

    res.status(201).json({
      id: review._id,
      productId: review.product_id,
      rating: review.rating,
      comment: review.comment,
      userId: review.user_id,
      userName: review.user_name,
      createdAt: review.created_at
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
};


