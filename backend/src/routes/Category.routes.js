const express = require("express");
const { getCategories } = require("../controllers/Category.controller");

const router = express.Router();

// GET /categories - Get all categories
router.get("/", getCategories);

module.exports = router;
