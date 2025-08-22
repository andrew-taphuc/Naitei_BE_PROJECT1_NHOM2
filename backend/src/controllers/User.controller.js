const User = require("../models/User");
const { objectIdToInt } = require("../utils/helpers");
const bcrypt = require("bcrypt");

// Mapping function for JSON server compatibility
const mapUserToJSONServerFormat = (user) => {
  return {
    id: objectIdToInt(user._id),
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    website: user.website || "",
    address: user.address || "",
    password: user.password, // Note: In production, never return password
    image: user.image,
  };
};

// Mapping function for standard API format
const mapUser = (u) => ({
  id: u._id,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone || "",
  address: u.address || "",
  image: u.image || "",
  role: u.role,
});

// JSON Server compatibility endpoints
// Get all users (for json-server compatibility)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // Exclude password for security
    const mappedUsers = users.map((user) => ({
      ...mapUserToJSONServerFormat(user),
      password: "123456", // Use dummy password for frontend compatibility
    }));
    res.json(mappedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID (for json-server compatibility)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const mappedUser = {
      ...mapUserToJSONServerFormat(user),
      password: "123456", // Use dummy password for frontend compatibility
    };
    res.json(mappedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Standard API endpoints
exports.list = async (_req, res) => {
  try {
    const users = await User.find().select(
      "_id full_name email phone address image role"
    );
    res.json(users.map(mapUser));
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select(
      "_id full_name email phone address image role"
    );
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(mapUser(u));
  } catch (e) {
    res.status(404).json({ message: "Not found" });
  }
};

exports.update = async (req, res) => {
  try {
    const { full_name, phone, address, image , role} = req.body || {};
    const updateDoc = {};
    if (full_name !== undefined) updateDoc.full_name = full_name;
    if (phone !== undefined) updateDoc.phone = phone;
    if (address !== undefined) updateDoc.address = address;
    if (image !== undefined) updateDoc.image = image;
    if (role !== undefined) updateDoc.role = role;

    const u = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateDoc },
      { new: true }
    ).select("_id full_name email phone address image role");
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// Profile endpoints (require authMiddleware)
exports.me = async (req, res) => {
  try {
    const u = await User.findById(req.user.userId).select(
      "_id full_name email phone address image role"
    );
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: "Server error" });
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

    const u = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateDoc },
      { new: true }
    ).select("_id full_name email phone address image role");
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(mapUser(u));
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, email, password, phone, address, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      full_name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};