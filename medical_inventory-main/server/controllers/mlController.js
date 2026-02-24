const { spawn } = require("child_process");
const path = require("path");

/**
 * GET /api/ml/predictions
 * Execute Python demand prediction script and return results
 */
const getDemandPredictions = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, "..", "ml", "demand_prediction.py");
    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    const child = spawn(pythonCmd, [scriptPath], {
      env: {
        ...process.env,
        MONGO_URI: process.env.MONGO_URI || process.env["MONGO_URI "] || "",
      },
      cwd: path.join(__dirname, ".."),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", stderr);
        return res.status(500).json({
          success: false,
          message: stderr || "Prediction script failed",
        });
      }

      try {
        const predictions = JSON.parse(stdout.trim());
        if (Array.isArray(predictions)) {
          return res.json({
            success: true,
            predictions: predictions.map((p) => ({
              itemName: p.itemName,
              predictedDemand: p.predictedDemand,
              predictedDemandNextMonth: p.predictedDemand,
            })),
          });
        }
        if (predictions.error) {
          return res.status(500).json({
            success: false,
            message: predictions.error,
          });
        }
        return res.json({ success: true, predictions: [] });
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        return res.status(500).json({
          success: false,
          message: "Invalid prediction output",
        });
      }
    });

    child.on("error", (err) => {
      console.error("Spawn error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to run prediction script",
      });
    });
  } catch (error) {
    console.error("ML predictions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch demand predictions",
    });
  }
};

module.exports = { getDemandPredictions };
