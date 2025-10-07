const multer = require("@koa/multer");

// Middleware for handling form-data files
const storage = multer.diskStorage({
  // Control file storage location
  destination: (req, file, cb) => {
    // Validate file type
    const fileType = ["image/png", "image/jpeg", "image/webp"];
    if (!fileType.includes(file.mimetype)) {
      return cb({
        msg: "Please upload a valid image",
        code: 422,
        validate: null,
      });
    }
    cb(null, "image_file/");
  },
  // Change file name
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(".");
    const newFile = `${new Date().getTime()}.${fileName[fileName.length - 1]}`;
    cb(null, newFile);
  },
});

const uploadFile = multer({ storage });
module.exports = uploadFile;
