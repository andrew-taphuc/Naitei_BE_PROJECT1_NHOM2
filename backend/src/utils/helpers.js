// Helper function to convert ObjectId to consistent integer
const objectIdToInt = (objectId) => {
  if (!objectId) return null;
  const str = objectId.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000; // Keep it reasonably sized
};

module.exports = {
  objectIdToInt,
};
