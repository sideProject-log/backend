const { isLoggedIn, isNotLoggedIn } = require("../middleware/auth");
const express = require("express");
const passport = require("passport");
const router = express.Router();

//카카오 로그인 요청 감지
router.get("/kakao", passport.authenticate("kakao"));

// 카카오 로그인 콜백
// router.get(
//   "/kakao/callback",
//   passport.authenticate("kakao", {
//     failureRedirect: process.env.FRONTURL + "/",
//   }),
//   (req, res) => {
//     console.log("callback", req.isAuthenticated(), req.user);
//     res.redirect(process.env.FRONTURL + "/main");
//   }
// );

router.get("/kakao/callback", passport.authenticate("kakao"), (req, res) => {
  console.log("callback", req.isAuthenticated(), req.user);
  res.redirect(process.env.FRONTURL + "/");
});

router.get("/isLogin", (req, res) => {
  console.log("callback", req.isAuthenticated(), isAuthenticated, req.user);

  res.status(200).json({
    status: "ok",
    result: req.isAuthenticated(),
    user: req.user,
  });
});

module.exports = router;
