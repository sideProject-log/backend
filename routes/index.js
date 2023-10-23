const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Project Log API Server 도영이가 배포함");
});

module.exports = router;
