const express = require("express");
const { getSettings, updateSetting } = require("../controller/settingController");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// Public route to fetch settings (e.g. for user frontend to know animation state)
router.get("/", getSettings);

// Admin only route to update settings
router.put("/", verifyJWT, verifyAdmin, updateSetting);

module.exports = router;
