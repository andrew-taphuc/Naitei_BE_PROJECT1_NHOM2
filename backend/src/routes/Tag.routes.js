const express = require("express");
const { getTags } = require("../controllers/Tag.controller");

const router = express.Router();

// GET /tags - Get all tags
router.get("/", getTags);

module.exports = router;
