const Blog = require("../models/Blog");

// Fixed mapping from original db.json to ensure no conflicts
const TAG_ID_MAP = {
  "Dễ chăm": 1,
  "Phong thủy": 2,
  DIY: 3,
  "Sen Đá": 4,
  "Trầu Bà": 5,
  "Kỹ thuật": 6,
  "Làm vườn": 7,
  "Mini plant": 8,
  "Chia sẻ": 9,
};

// Reverse mapping for ID -> Name
const TAG_NAME_MAP = Object.fromEntries(
  Object.entries(TAG_ID_MAP).map(([name, id]) => [id, name])
);

// Get tag ID by name (sync - no need for async)
const getTagIdByName = (tagName) => {
  return TAG_ID_MAP[tagName] || null;
};

// Get tag name by ID (sync - no need for async)
const getTagNameById = (tagId) => {
  return TAG_NAME_MAP[parseInt(tagId)] || null;
};

// Get all tags with their IDs (for /tags endpoint)
const getAllTagsWithIds = async () => {
  try {
    // Get all unique tags from database
    const dbTags = await Blog.distinct("tags");
    const validTags = dbTags.filter(
      (tag) => tag && typeof tag === "string" && TAG_ID_MAP[tag]
    );

    return validTags
      .map((tagName) => ({
        id: TAG_ID_MAP[tagName], // Return as number, not string
        name: tagName,
      }))
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

module.exports = {
  getTagIdByName,
  getTagNameById,
  getAllTagsWithIds,
};
