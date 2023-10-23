//로그인 감지
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인이 필요합니다.");
  }
};

//로그인 감지
// TODO
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    console.log("이미 로그인 한 유저임");
    res.redirect(process.env.FRONTURL + "/main");
  }
};
