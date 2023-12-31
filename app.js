require("dotenv").config();

const express = require("express");

const port = process.env.PORT;

const cookieParser = require("cookie-parser");
const passport = require("passport");
const passportConfig = require("./auth");
const session = require("express-session");
const cors = require("cors");

const indexRouter = require("./routes/index");
const recordRouter = require("./routes/record");
const userRouter = require("./routes/user");
const commentRouter = require("./routes/comments");
const bookmarkRouter = require("./routes/bookmark");
const authRouter = require("./routes/auth");

const app = express();
passportConfig();

//Cors 설정
app.use(cors({ origin: true, credentials: true }));

//request 요청 URL과 처리 로직을 선언한 라우팅 모듈 매핑
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//세션 및 쿠키 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

//패스포트 설정
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/api/record", recordRouter);
app.use("/api/user", userRouter);
app.use("/api/comments", commentRouter);
app.use("/api/bookmark", bookmarkRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
