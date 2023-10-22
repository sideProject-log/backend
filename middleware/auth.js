//로그인 감지
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    console.log("로그인오류");
    res.status(403).send("로그인이 필요합니다.");
  }
};

//로그인 감지
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    console.log("로그인오류");
    res.status(403).send("로그인 상태입니다.");
  }
};
