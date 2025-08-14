const User = require("../models/User");
const { objectIdToInt } = require("../utils/helpers");

// Mapping function to match frontend JSON server format
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
