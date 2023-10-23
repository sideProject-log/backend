const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { isLoggedIn } = require("../middleware/auth");
const router = express.Router();

const prismaClient = new PrismaClient();

//유저 정보 찾기
router.get("/info/:id", async (req, res) => {
  try {
    const user_id = Number(req.params.id);

    const user = await prismaClient.user.findUnique({
      where: {
        id: user_id,
      },
    });

    const records = await prismaClient.record.findMany({
      where: {
        user_id: user_id,
      },
    });

    res.status(201).json({
      status: "ok",
      username: user.username, // 유저네임
      introduction: user.introduction, // 유저 설명 글
      emoticon: user.emoji, // 유저 감정 상태 이모지
      profile: user.profile, // 유저 프로필
      records: [...records], // 유저가 작성한 글들
    });
  } catch (e) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

// 유저 생성
router.post("/create", async (req, res) => {
  try {
    const { username, introduction, emoji, profile } = req.body;

    const newUser = await prismaClient.user.create({
      data: {
        username,
        introduction,
        emoji,
        profile,
      },
    });
    console.log(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

//유저가 북마크한 정보 불러오기
router.get("/bookmarks", isLoggedIn, async (req, res) => {
  try {
    const records = await prismaClient.record.findMany({
      where: {
        bookmark: {
          some: {
            user_id: req.user.id,
          },
        },
      },
    });

    const RecordsWithCounts = await Promise.all(
      records.map(async (record) => {
        const emojis = await prismaClient.comments.count({
          where: {
            user_id: req.user.id,
            record_id: record.id,
          },
        });

        const user = await prismaClient.user.findUnique({
          where: {
            id: record.user_id,
          },
        });

        return {
          ...record,
          emojiCount: emojis,
          writer: user.username,
        };
      })
    );

    console.log(RecordsWithCounts);

    res.status(201).json({ status: "ok", data: RecordsWithCounts });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

router.patch("/modify/username", isLoggedIn, async (req, res) => {
  try {
    const { username } = req.body;
    let result = null;
    if (req.user) {
      result = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          username,
        },
      });
    }
    res.status(201).json({ status: "ok", result });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

module.exports = router;
