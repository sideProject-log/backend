const { PrismaClient } = require("@prisma/client");
const { isLoggedIn } = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const express = require("express");
const { uploadFile } = require("../util/fileManage");
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
            profile: true,
          },
        },
        comments: true, // 댓글을 가져오기 위한 include
      },
    });

    console.log("전체", records);

    if (req.user) {
      const bookmarks = await prismaClient.bookmark.findMany({
        where: {
          user_id: req.user.id,
        },
      });

      console.log("bookmarks", bookmarks);

      records.map((record) => {
        // records 배열을 돌면서 각 record에 대한 처리를 수행합니다.
        const isBookmarked = bookmarks.some(
          (bookmark) => bookmark.record_id === record.id
        );
        record.bookmarked = isBookmarked;
        return record;
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
router.get("/detail/:id", async (req, res) => {
  let record = null;
  try {
    const id = req.params.id * 1;
    record = await prismaClient.record.findUnique({
      where: { id },
    });
    console.log(record);

    if (req.user) {
      console.log("user info", req.user);
      const userId = +req.user.id;
      let user = await prismaClient.user.findUnique({
        where: { id: +record.user_id },
      });
      writer = user.username;
      profileImage = user.profile;

      let bookmark = await prismaClient.bookmark.findMany({
        where: {
          user_id: userId,
          record_id: id,
        },
      });
      const bookmarkId = bookmark[0] ? bookmark[0].id : null;

      const comments = await prismaClient.comments.findMany({
        where: {
          record_id: id,
        },
        include: {
          user: {
            select: {
              username: true,
              profile: true,
            },
          },
        },
      });

      const commentInfoList = comments
        .map(({ id, user_id, comment, user }) => {
          return {
            id,
            userId: user_id,
            comment,
            username: user.username,
            profile: user.profile,
          };
        })
        .sort((a, b) => a.userId - b.userId);

      const commentList = comments
        .map((comment) => comment.comment)
        .filter((value, index, self) => self.indexOf(value) === index);

      record = {
        ...record,
        writer,
        profileImage,
        bookmarkId,
        commentList,
        commentInfoList,
      };
    }

    if (record !== null) {
      console.log(record);
      res.status(200).json({ status: "ok", record });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "글을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// record 작성
router.post("/post", isLoggedIn, async (req, res) => {
  try {
    if (req.body.image) {
      const data = await uploadFile(req.body.image, "logo.png");
      req.body.image = data.url;
    }

    console.log(req.body);

    const date = new Date();

    date.setHours(date.getHours() + 9);

    const newRecord = await prismaClient.record.create({
      data: {
        ...req.body,
        user_id: Number(req.user.id),
      },
    });

    res.status(201).json({ status: "ok", data: newRecord });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

// record 수정
router.patch("/edit", isLoggedIn, async (req, res) => {
  try {
    const { postId, title, content } = req.body;

    const newRecord = await prismaClient.record.update({
      where: {
        id: Number(postId),
      },
      data: {
        title,
        content,
      },
    });

    if (req.user) {
      let user = await prismaClient.user.findUnique({
        where: { id: +newRecord.user_id },
      });

      writer = user.username;
      profileImage = user.profile;
    }

    res
      .status(201)
      .json({ statusbar: "ok", ...newRecord, writer, profileImage });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//레코드 삭제
router.delete("/remove", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    console.log("postId", postId);

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

//유저가 작성한 포스트 불러오기 - 아이디 미지정
router.get("/my", isLoggedIn, async (req, res) => {
  try {
    const records = await prismaClient.record.findMany({
      where: {
        user_id: Number(req.user.id),
      },
    });

    const recordData = await Promise.all(
      records.map(async (record) => {
        const bookmarks = await prismaClient.bookmark.count({
          where: {
            user_id: req.user.id,
            record_id: record.id,
          },
        });
        const emojis = await prismaClient.comments.count({
          where: {
            user_id: req.user.id,
            record_id: record.id,
          },
        });

        return {
          ...record,
          writer: record.user.username,
          bookmarks: bookmarks,
          emojis: emojis,
          date: `${record.created_at.getFullYear()}년 ${
            record.created_at.getMonth() + 1
          }월`,
          day: record.created_at.getDate(),
        };
      })
    );

    const dateList = [];

    recordData.map((record) => {
      if (!dateList.includes(record.date)) {
        dateList.push(record.date);
      }
    });

    res
      .status(200)
      .json({ status: "ok", records: recordData, dates: dateList });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

//유저가 작성한 포스트 불러오기 - 아이디 지정
router.get("/find/:id", async (req, res) => {
  try {
    const user_id = +req.params.id;

    const user = await prismaClient.user.findUnique({
      where: {
        id: user_id,
      },
    });

    const records = await prismaClient.record.findMany({
      where: {
        user_id,
      },
    });

    const recordData = await Promise.all(
      records.map(async (record) => {
        const bookmarks = await prismaClient.bookmark.count({
          where: {
            user_id,
            record_id: record.id,
          },
        });
        const emojis = await prismaClient.comments.count({
          where: {
            user_id,
            record_id: record.id,
          },
        });

        return {
          ...record,
          bookmarks: bookmarks,
          emojis: emojis,
          date: `${record.created_at.getFullYear()}년 ${
            record.created_at.getMonth() + 1
          }월`,
          day: record.created_at.getDate(),
        };
      })
    );

    const dateList = [];

    recordData.map((record) => {
      if (!dateList.includes(record.date)) {
        dateList.push(record.date);
      }
    });

    res
      .status(200)
      .json({ status: "ok", records: recordData, dates: dateList, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "서버 에러", message: error.message });
  }
});

module.exports = router;
