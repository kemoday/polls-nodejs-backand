const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    require: true,
    minlength: 5,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    minlength: 5,
  },
  password: {
    type: String,
    require: true,
    minlength: 8,
  },
  polls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Polls",
      default: null,
    },
  ],
});

var handleE11000 = function (error, res, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("There was a duplicate key error"));
  } else {
    next();
  }
};

UserSchema.on("save", handleE11000);
UserSchema.on("update", handleE11000);
UserSchema.on("findOneAndUpdate", handleE11000);
UserSchema.on("insertMany", handleE11000);

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
