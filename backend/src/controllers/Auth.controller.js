const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

exports.googleLogin = async (req, res) => {
  try {
    const { auth_token } = req.body;
    
    if (!auth_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu Google auth token' 
      });
    }

    // Get user info from Google using access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      console.error('Google API Error:', userInfoResponse.status);
      throw new Error('Failed to get user info from Google');
    }
    
    const userInfo = await userInfoResponse.json();
    const { email, name, picture, id: googleId } = userInfo;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể lấy email từ Google' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        full_name: name || 'Google User',
        email: email,
        password: await bcrypt.hash(googleId, 10), // Use googleId as password hash
        googleId: googleId,
        avatar: picture,
        role: 'user'
      });
    } else if (!user.googleId) {
      // Link existing user with Google account
      user.googleId = googleId;
      if (picture) user.avatar = picture;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      token,
      userId: String(user._id),
      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token Google không hợp lệ' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực Google' 
    });
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const { auth_token } = req.body;
    
    if (!auth_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu Facebook auth token' 
      });
    }

    // Get user info from Facebook using access token
    const userInfoResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${auth_token}`);
    
    if (!userInfoResponse.ok) {
      console.error('Facebook API Error:', userInfoResponse.status);
      throw new Error('Failed to get user info from Facebook');
    }
    
    const userInfo = await userInfoResponse.json();
    const { email, name, picture, id: facebookId } = userInfo;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể lấy email từ Facebook' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        full_name: name || 'Facebook User',
        email: email,
        password: await bcrypt.hash(facebookId, 10), // Use facebookId as password hash
        facebookId: facebookId,
        avatar: picture?.data?.url,
        role: 'user'
      });
    } else if (!user.facebookId) {
      // Link existing user with Facebook account
      user.facebookId = facebookId;
      if (picture?.data?.url) user.avatar = picture.data.url;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      token,
      userId: String(user._id),
      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Facebook login error:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực Facebook' 
    });
  }
};


