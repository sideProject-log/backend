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
router.delete("/remove", async (req, res, next) => {
  const { bookmarkId } = req.body;
  console.log("remove bookmark");

  try {
    let result = null;
    if (req.user) {
      result = await prismaClient.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
    }
    console.log(result);
    res.status(201).json({ status: "ok", result });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
