const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Project Log API Server");
});

module.exports = router;
