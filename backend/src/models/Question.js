import mongoose from 'mongoose';

const optionsSchema = mongoose.Schema({
  text: { type: String, required: true },
});

const questionSchema = mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    options: [optionsSchema], // Array of 4 options
    correctAnswer: {
      type: Number, // Index of the correct option (0, 1, 2, or 3)
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
