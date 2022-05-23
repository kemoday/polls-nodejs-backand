const Polls = require("./../models/polls.module");
const Users = require("./../models/users.module");
const router = require("express").Router();
const Joi = require("joi");
const jsonwebtoken = require("jsonwebtoken");

const validatePollData = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required(),
    question: Joi.string().required(),
    options: Joi.array().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token) {
    try {
      jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET);
      return next();
    } catch (error) {
      return res.status(404).send({ error: true, message: "invaild token" });
    }
  } else
    return res
      .status(401)
      .send({ error: true, message: "you are not logged in." });
};

// C : /poll        -> post

router.route("/").post(validatePollData, (req, res) => {
  const newPoll = new Polls({ ...req.body, views: 0 });
  newPoll
    .save()
    .then((poll) => {
      Users.findOne({ _id: poll.userId }).then((user) => {
        user.polls.unshift(poll);
        user.save().then(() => {
          return res.send(poll);
        });
      });
    })
    .catch(() => {
      res
        .status(501)
        .send({ error: true, message: "error while adding new poll" });
    });
});

// R : /poll        -> get

router.route("/user/:userId").get(isLoggedIn, (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(401).json({
      error: true,
      message: "User id is required.",
    });
  }

  Polls.find({ userId }, function (err, polls) {
    if (err) {
      console.log(err);
    }
    if (polls) {
      res.send(polls);
    } else {
      res.json([]);
    }
  });
});

// R : /poll/:id    -> get

router.route("/:id").get((req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(401).json({
      error: true,
      message: "Poll id is is required to get it!.",
    });
  }

  Polls.findOneAndUpdate(
    { _id: id },
    {
      $inc: { views: 1 },
    },
    { new: true, upsert: true },
    function (err, poll) {
      if (err) {
        console.log(err);
      }
      if (poll) {
        res.send(poll);
      } else {
        res.status(404).json({ message: "poll not found", error: true });
      }
    }
  );
});

// U : /poll/:id    -> put

// no update for you!

router.route("/vote/:pollId").put((req, res) => {
  const pollId = req.params.pollId;
  Polls.findByIdAndUpdate(pollId, { options: req.body }, function (err, poll) {
    if (err) {
      console.log(err);
      res.status(404).send();
    } else {
      res.send(poll);
    }
  });
});

router.route("/vote/:id").post((req, res) => {
  const { optionid, pollid } = req.body;

  Polls.findById({ _id: pollid }, function (err, poll) {
    poll.options.map((op, idx) => {
      if (op._id == optionid) {
        poll.options[idx].votes = poll.options[idx].votes + 1;
        poll.save();
      }
    });

    res.send(poll.options);
  });
});

// D : /poll/:id    -> delete

router.route("/:id").delete((req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      error: true,
      message: "Poll id is is required to get it!.",
    });
  }
  Polls.findOneAndRemove({ _id: id }, (err, docs) => {
    res.status(200).send(`Poll with id:${id} is removed!`);
  }).catch((err) => {
    res.status(404).json({ error: true, message: "Poll not found" });
  });
});

module.exports = router;
