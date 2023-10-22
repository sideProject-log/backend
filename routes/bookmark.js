const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

// 북마크 등록 API
router.post("/register", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, recordId } = req.body;

    const newBookmark = await prismaClient.bookmark.create({
      data: {
        user_id: Number(userId),
        record_id: Number(recordId),
      },
    });
    res.status(201).json({ status: "ok", newBookmark });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 북마크 삭제 API
router.delete("/remove", isLoggedIn, async (req, res, next) => {
  const { bookmarkId } = req.body;

  try {
    const result = await prismaClient.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
    res.status(201).json({ status: "ok", result });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
