const express = require("express");
const { getAllUsers, getUserById } = require("../controllers/User.controller");

const router = express.Router();

// GET /users - Get all users
router.get("/", getAllUsers);

// GET /users/:id - Get user by ID
router.get("/:id", getUserById);

module.exports = router;
