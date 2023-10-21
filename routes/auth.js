const express = require("express");
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("../middleware/auth");
const router = express.Router();

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

router.get("/isLogin", isLoggedIn, (req, res) => {
  res.status(200).send("굳");
});

router.get("/isNotLogin", isNotLoggedIn, (req, res) => {
  res.status(200).send("굳");
});

module.exports = router;
