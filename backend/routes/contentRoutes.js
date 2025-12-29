const express = require("express");
const router = express.Router();
const {
  getAllContent,
  getContentByKey,
  getContentByPage,
  upsertContent,
  updateMultipleContents,
  deleteContent,
  initializeDefaultContent,
} = require("../controller/contentController");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

// Public routes (for user frontend)
router.get("/get-all", getAllContent);
router.get("/get-by-key/:key", getContentByKey);
router.get("/get-by-page/:page", getContentByPage);

// Admin routes
router.use(verifyJWT);
router.use(verifyAdmin);
router.post("/upsert", upsertContent);
router.post("/update-multiple", updateMultipleContents);
router.delete("/delete/:key", deleteContent);
router.post("/initialize-defaults", initializeDefaultContent);

module.exports = router;
