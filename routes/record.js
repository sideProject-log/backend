const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

// record 전체 조회
router.get("/getAll", async (req, res) => {
  try {
    const records = await prismaClient.record.findMany();
    console.log(records);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// record 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id * 1;
    const record = await prismaClient.record.findUnique({
      where: { id: Number(id) },
    });

    console.log(record);

    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: "글을 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

// record 작성
router.post("/post", isLoggedIn, async (req, res) => {
  try {
    const { title, emoji, content, background, user_id } = req.body;

    const newRecord = await prismaClient.record.create({
      data: {
        title,
        emoji,
        content,
        background,
        user_id: Number(user_id),
      },
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

// record 수정
router.patch("/edit", isLoggedIn, async (req, res) => {
  try {
    const { postId, title, emoji, content, background } = req.body;

    const newRecord = await prismaClient.record.update({
      where: {
        id: postId,
      },
      data: {
        title,
        emoji,
        content,
        background,
      },
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

router.delete("/remove", isLoggedIn, async () => {
  try {
    const { postId } = req.body;

    const deletedRecord = await prismaClient.record.delete({
      where: {
        id: postId,
      },
    });

    res.status(201).json(deletedRecord);
  } catch (error) {
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

module.exports = router;
