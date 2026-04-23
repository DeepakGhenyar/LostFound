const Item = require("../models/Item");

// @POST /api/items  → Add item
exports.addItem = async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    const item = await Item.create({
      itemName,
      description,
      type,
      location,
      date: date || Date.now(),
      contactInfo,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Item reported successfully", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/items  → View all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/items/:id  → View item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("postedBy", "name email");
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/items/:id  → Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Only owner can update
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own items" });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Item updated successfully", item: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/items/:id  → Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Only owner can delete
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own items" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/items/search?name=xyz  → Search items by name
exports.searchItems = async (req, res) => {
  try {
    const { name, category } = req.query;
    const query = {};

    if (name) {
      query.itemName = { $regex: name, $options: "i" };
    }
    if (category) {
      query.type = category; // "Lost" or "Found"
    }

    const items = await Item.find(query).populate("postedBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
