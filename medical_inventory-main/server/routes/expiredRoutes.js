const express  = require("express");
const { moveExpiredItems, getExpiredItems } = require("../controllers/expiredItemController.js");


const router = express.Router();

// Route to get all expired items
router.get("/", getExpiredItems);

// Route to process expired items
router.post("/check-expired", moveExpiredItems);
  

module.exports = router;
