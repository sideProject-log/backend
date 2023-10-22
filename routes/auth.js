const { isLoggedIn, isNotLoggedIn } = require("../middleware/auth");
const express = require("express");
const passport = require("passport");
const router = express.Router();

//카카오 로그인 요청 감지
router.get("/kakao", isNotLoggedIn, passport.authenticate("kakao"));

//카카오 로그인 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/main");
  }
);

router.get("/isLogin", (req, res) => {
  res.status(200).json({
    status: "ok",
    result: req.isAuthenticated(),
    user: req.user,
  });
});

module.exports = router;
