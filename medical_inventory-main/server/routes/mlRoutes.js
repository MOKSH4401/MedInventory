const express = require("express");
const { getDemandPredictions } = require("../controllers/mlController");

const router = express.Router();

router.get("/predictions", getDemandPredictions);

module.exports = router;
