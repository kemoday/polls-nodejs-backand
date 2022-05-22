const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pollSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        text: {
          type: String,
          trim: true,
          required: true,
        },
        votes: {
          type: Number,
          required: true,
          trim: true,
          default: 0,
        },
      },
    ],
    views: {
      trim: true,
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Polls = mongoose.model("Polls", pollSchema);

module.exports = Polls;
