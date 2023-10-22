const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const express = require("express");
const router = express.Router();

const prismaClient = new PrismaClient();

// record 전체 조회
router.get("/getAll", async (req, res) => {
  try {
    const records = await prismaClient.record.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        comments: true, // 댓글을 가져오기 위한 include
      },
    });

    if (req.user) {
      const bookmarks = await prismaClient.bookmark.findMany({
        where: {
          user_id: req.user.id,
        },
      });
      records.map((record) => {
        bookmarks.map((bookmark) => {
          if (record.id === bookmark.record_id) {
            record.bookmarked = true;
          } else {
            record.bookmarked = false;
          }
        });
      });
    }

    // 각 게시글의 댓글 수 계산, 작성자
    const recordsWithCommentCount = records.map((record) => {
      return {
        ...record,
        writer: record.user.username,
        emojiCount: record.comments.length, // 댓글 수 계산
      };
    });

    res.status(200).json({ status: "ok", data: recordsWithCommentCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// record 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id * 1;
    let record = await prismaClient.record.findUnique({
      where: { id: Number(id) },
    });

    if (req.user) {
      const bookmarkId = await prismaClient.bookmark.findUnique({
        where: {
          user_id: req.user.id,
          record_id: id,
        },
      });

      const comments = await prismaClient.comments.findMany({
        where: {
          user_id: req.user.id,
          record_id: id,
        },
      });
      const commentList = comments
        .map((comment) => comment.comment)
        .filter((value, index, self) => self.indexOf(value) === index);

      record = { ...record, bookmarkId, commentList };
    }

    if (record) {
      res.status(200).json({ status: "ok", record });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "글을 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// record 작성
router.post("/post", isLoggedIn, async (req, res) => {
  try {
    const { title, emoji, content, background } = req.body;

    const date = new Date();

    date.setHours(date.getHours() + 9);

    const newRecord = await prismaClient.record.create({
      data: {
        title,
        emoji,
        content,
        background,
        created_at: date,
        user_id: Number(req.user.id),
      },
    });

    res.status(201).json({ status: "ok", data: newRecord });
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

    res.status(201).json({ statusbar: "ok", newRecord });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//레코드 삭제
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
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
