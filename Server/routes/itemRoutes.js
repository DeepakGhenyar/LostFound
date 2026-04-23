const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  searchItems,
} = require("../controllers/itemController");

// Protected routes (must be logged in)
router.post("/", protect, addItem);           // POST /api/items → Add item
router.get("/", protect, getAllItems);         // GET /api/items → View all items
router.get("/search", protect, searchItems);  // GET /api/items/search?name=xyz
router.get("/:id", protect, getItemById);     // GET /api/items/:id → View by ID
router.put("/:id", protect, updateItem);      // PUT /api/items/:id → Update item
router.delete("/:id", protect, deleteItem);   // DELETE /api/items/:id → Delete item

module.exports = router;
