var jwt = require("jsonwebtoken");
const Users = require("./../models/users.module");
const router = require("express").Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");

const validateSinggingupData = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token) {
    try {
      jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      return res
        .status(401)
        .send({ error: true, message: "you are already logged in." });
    } catch (error) {
      res.status(404).send({ error: true, message: "invaild token" });
    }
  } else next();
};

const validateSingginData = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

router
  .route("/signup")
  .post(isLoggedIn, validateSinggingupData, async (req, res) => {
    const hashed_password = await bcrypt.hash(req.body.password, 10);
    const hashed_body = { ...req.body, password: hashed_password, polls: [] };

    const new_user = new Users(hashed_body);
    new_user
      .save()
      .then((user) => {
        const token = jwt.sign(
          { email: req.body.email },
          process.env.JWT_SECRET
        );
        res
          .cookie("token", token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: true,
          })
          .status(201)
          .send({
            ...req.body,
            name: user.name,
            _id: user._id,
            polls: user.polls,
          });
      })
      .catch((error) => {
        if (error.code == "11000")
          res
            .status(400)
            .send({ error: true, message: "email already exists." });
        else
          res
            .status(500)
            .send({ error: true, message: "error while adding new user" });
      });
  });

router.route("/signin").post(validateSingginData, async (req, res) => {
  const user_password = req.body.password;
  const user_email = req.body.email;

  try {
    const user = await Users.findOne({ email: user_email })
      .populate({
        path: "polls",
        model: "Polls",
      })
      .exec();

    if (user === null)
      return res
        .status(404)
        .send({ error: true, message: "user is not found" });

    if (bcrypt.compare(user_password, user.password)) {
      const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET);

      res
        .cookie("token", token, {
          maxAge: 3600000,
          httpOnly: true,
          secure: true,
        })
        .send({
          ...req.body,
          name: user.name,
          _id: user._id,
          polls: user.polls,
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: true, message: "error while logging in" });
  }
});

router.route("/user").get(async (req, res) => {
  if (req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      const user = await Users.findOne({ email: decoded.email })
        .populate({
          path: "polls",
          model: "Polls",
        })
        .exec();
      res.send(user);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ error: true, message: "error while getting user data." });
    }
  } else res.send("you are not sigen in.");
});

router.route("/signout").put((req, res) => {
  res.clearCookie("token").send("log out successfully!");
});

module.exports = router;
