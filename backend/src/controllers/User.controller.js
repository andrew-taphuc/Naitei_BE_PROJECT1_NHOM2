const User = require('../models/User');

const mapUser = (u) => ({
  id: u._id,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone || '',
  address: u.address || '',
  image: u.image || '',
  role: u.role,
});

exports.list = async (_req, res) => {
  try {
    const users = await User.find().select('_id full_name email phone address image role');
    res.json(users.map(mapUser));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('_id full_name email phone address image role');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(mapUser(u));
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
};

exports.update = async (req, res) => {
  try {
    const { fullName, phone, address, image } = req.body || {};
    const updateDoc = {};
    if (fullName !== undefined) updateDoc.full_name = fullName;
    if (phone !== undefined) updateDoc.phone = phone;
    if (address !== undefined) updateDoc.address = address;
    if (image !== undefined) updateDoc.image = image;

    const u = await User.findByIdAndUpdate(req.params.id, { $set: updateDoc }, { new: true })
      .select('_id full_name email phone address image role');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Profile endpoints (require authMiddleware)
exports.me = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId).select('_id full_name email phone address image role');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName, phone, address, image } = req.body || {};
    const updateDoc = {};
    if (fullName !== undefined) updateDoc.full_name = fullName;
    if (phone !== undefined) updateDoc.phone = phone;
    if (address !== undefined) updateDoc.address = address;
    if (image !== undefined) updateDoc.image = image;

    const u = await User.findByIdAndUpdate(req.user.userId, { $set: updateDoc }, { new: true })
      .select('_id full_name email phone address image role');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};


