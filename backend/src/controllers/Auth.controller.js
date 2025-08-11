const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { fullName, phone, email, website, password, receiveEmail } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name: fullName,
      phone,
      email,
      password: hashed,
      website,
      receiveEmail
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ success: true, token, user: { id: user._id, name: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ 
      success: true,
      token, 
      userId: String(user._id),
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('_id full_name email role');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    return res.json({ id: user._id, name: user.full_name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


