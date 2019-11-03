const express = require("express");
const multer = require("multer");
const Material = require("../models/Material");
const path = require("path");
const fs = require("fs");
const auth = require("../middlewares/auth");
const isMember = require("../middlewares/isMember");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

// @route   POST api/room/:code/upload
// @desc    Upload File To Classroom
// @access  PRIVATE / ROOM ADMIN
router.post("/:code/upload", auth, isAdmin, async (req, res) => {
  const code = req.params.code;
  let extension;

  // Multer Storage Engine
  const storage = multer.diskStorage({
    destination: `./data/${code}/`,
    filename: function(req, file, cb) {
      extension = file.originalname.split(".")[1];
      cb(null, `${code}-${Date.now()}.${extension}`);
    }
  });

  // Initializing Upload
  const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 },
    fileFilter: function(req, file, cb) {
      if (file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/)) {
        return cb(null, true);
      } else {
        return cb(new Error("Unsupported File Format!"), false);
      }
    }
  }).single("material");

  try {
    // Uploading File
    upload(req, res, err => {
      if (err) {
        // Send Error If There is Any
        res.status(400).json({ msg: err.message });
      } else {
        // Setting File Type
        let fileType;

        if (extension === "pdf") {
          fileType = "pdf";
        } else if (extension === "doc" || extension === "docx") {
          fileType = "doc";
        } else if (extension === "ppt" || extension === "pptx") {
          fileType = "ppt";
        } else if (extension === "xls" || extension === "xlsx") {
          fileType = "xls";
        }

        // Create New Instance of Material Model
        const material = new Material({
          fileName: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileType: fileType,
          size: req.file.size,
          classroom: req.room._id,
          uploadedBy: req.student._id
        });

        // Setting Dynamic Download Link
        material.downloadLink = `/room/${code}/file/${material._id}`;

        // Save in Database
        material.save();

        res.json(material);
      }
    });
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET api/room/:code/files
// @desc GET All files of Room
// @access PRIVATE / ROOM MEMBER
router.get("/:code/files", auth, isMember, async (req, res) => {
  try {
    // Search Database for Available Files in Room
    const material = await Material.find({ classroom: req.roomId }).sort({
      _id: -1
    });

    // Send Response If There Are No Files in Room
    if (!material) return res.json({ msg: "No Files Available!" });

    // Send Material
    res.json(material);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/room/:code/file/:id
// @desc Download Single File From a Room
// @access PRIVATE / ROOM MEMBER
router.get("/:code/file/:id", auth, isMember, async (req, res) => {
  // Extracting Values from Request
  const code = req.params.code;
  const id = req.params.id;

  try {
    // Search File in The Database
    const material = await Material.findById(id);

    // Send Error If File is Not Found
    if (!material) return res.status(404).json({ msg: "File Not Found!" });

    // File Path
    const file = path.join(
      __dirname,
      "..",
      "/data/",
      `${code}`,
      `${material.fileName}`
    );

    res.download(file, `${material.originalName}`);
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/room/:code/file/:id
// @desc Delete a Single File From a Room
// @access PRIVATE / ROOM ADMIN
router.delete("/:code/file/:id", auth, isAdmin, async (req, res) => {
  // Extracting Values from Request
  const code = req.params.code;
  const id = req.params.id;

  try {
    // Search & Delete File in The Database
    const material = await Material.findByIdAndDelete(id);

    // Send Error If File Not Found in Database
    if (!material) return res.status(404).json({ msg: "File Not Found!" });

    // File Path
    const file = path.join(
      __dirname,
      "..",
      "/data/",
      `${code}`,
      `${material.fileName}`
    );

    // Delete File From "Data" Folder
    await fs.unlink(file, err => {
      if (err) throw err;
    });

    res.send();
  } catch (err) {
    // Log & Send Internal Server Error
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
