const express = require("express");
const itemconrollers = require("../controllers/itemcontrollers");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", itemconrollers.getItems);
router.post("/",upload.single("image"),itemconrollers.createItem);
router.put("/:id", upload.single("image"),itemconrollers.updateItem);
router.delete("/:id",itemconrollers.deleteItem);
router.get("/:id", itemconrollers.getsingleitem);
router.post("/:id/buy", itemconrollers.updatestock);

  
 
module.exports=router;
