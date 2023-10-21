const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const prismaClient = new PrismaClient();

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.REST_KEY,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await prismaClient.user.findUnique({
            where: {
              snsId: String(profile.id),
            },
          });

          if (exUser) {
            done(null, exUser, {
              accessToken,
              refreshToken,
            });
            return;
          }

          const newUser = await prismaClient.user.create({
            data: {
              snsId: String(profile.id),
              username: profile._json.properties.nickname,
              emoji: "🐦",
              profile: profile._json.properties.profile_image,
              introduction: "",
            },
          });

          console.log(newUser);
          done(null, newUser, {
            accessToken,
            refreshToken,
          });
        } catch (e) {
          console.log(e.message);
        }
      }
    )
  );
};
