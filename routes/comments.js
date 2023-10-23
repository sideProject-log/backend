const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

const EmojiRegex = require("emoji-regex");

// 이모지 댓글 등록
router.post("/register", isLoggedIn, async (req, res, next) => {
  try {
    const { recordId, emoji } = req.body;

    const regex = EmojiRegex();

    if (!`${emoji}`.match(regex)) {
      throw new Error(`Emoji ${emoji} is not allowed.`);
    }

    let newComment = null;
    if (req.user) {
      newComment = await prismaClient.comments.create({
        data: {
          user_id: req.user.id,
          record_id: +recordId,
          comment: emoji,
        },
      });
    }
    console.log(newComment);

    res.status(200).json({ status: "ok", newComment });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 이모지 삭제
router.delete("/remove", isLoggedIn, async (req, res, next) => {
  const { commentId } = req.body;

  // TODO: 등록된 이모지 삭제
  try {
    await prismaClient.comments.delete({
      where: {
        id: Number(commentId),
      },
    });
    res
      .status(201)
      .json({ status: "ok", message: "성공적으로 삭제되었습니다." });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
