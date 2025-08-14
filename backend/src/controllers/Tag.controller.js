const { getAllTagsWithIds } = require("../utils/tagMappingSimple");

// Get all tags (for json-server compatibility)
exports.getTags = async (req, res) => {
  try {
    const tags = await getAllTagsWithIds();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
