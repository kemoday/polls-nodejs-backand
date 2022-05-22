const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  useremail: String,
  userpass: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
  ],
});
const PostSchema = new Schema({
  title: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  body: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
    },
  ],
});
const CommentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  posts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
  },
  body: String,
});

const Users = mongoose.model("Users", UserSchema);
const Posts = mongoose.model("Posts", PostSchema);
const Comments = mongoose.model("Comments", CommentSchema);

module.exports = { Users, Posts, Comments };
