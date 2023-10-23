const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

// 북마크 등록 API
router.post("/register", isLoggedIn, async (req, res, next) => {
  try {
    const { recordId } = req.body;

    const newBookmark = await prismaClient.bookmark.create({
      data: {
        user_id: req.user.id,
        record_id: +recordId,
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

// 북마크 삭제 API
router.delete("/delete/:recordId", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id; // 사용자 ID 추출
    const recordId = parseInt(req.params.recordId); // URL 파라미터에서 레코드 ID 추출

    // 사용자의 북마크 목록 가져오기
    const bookmarks = await prismaClient.bookmark.findMany({
      where: {
        user_id: userId,
      },
    });

    // 북마크 목록에서 recordId와 일치하는 북마크 삭제
    for (const bookmark of bookmarks) {
      if (bookmark.record_id === recordId) {
        await prismaClient.bookmark.delete({
          where: {
            id: bookmark.id,
          },
        });
      }
    }

    res.status(201).json({ status: "ok", message: "bookmark deleted" });
  } catch (error) {
    console.warn(error.message);

    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
