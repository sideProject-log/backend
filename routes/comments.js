const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

const EmojiRegex = require("emoji-regex");

// 이모지 댓글 등록
router.post("/register", async (req, res, next) => {
  try {
    const { userId, recordId, comment } = req.body;

    const regex = EmojiRegex();

    if (!`${emoji}`.match(regex)) {
      throw new Error(`Emoji ${comment} is not allowed.`);
    }

    const newComment = await prismaClient.comments.create({
      data: {
        user_id: Number(userId),
        record_id: recordId,
        comment,
      },
    });

    res.status(200).json({ status: "ok", newComment });
  } catch (error) {
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

// 이모지 삭제
router.delete("/remove", async (req, res, next) => {
  const { emojiId } = req.body;

  // TODO: 등록된 이모지 삭제
  try {
    const result = await prismaClient.comments.delete({
      where: {
        id: Number(emojiId),
      },
    });
    res
      .status(201)
      .json({ status: "ok", message: "성공적으로 삭제되었습니다." });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

module.exports = router;
