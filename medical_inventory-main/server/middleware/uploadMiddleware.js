// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploading file to: uploads/"); // Debugging log
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log("Received file:", file.originalname); // Debugging log
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;