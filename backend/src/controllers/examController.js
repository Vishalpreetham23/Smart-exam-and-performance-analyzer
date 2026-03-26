import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Teacher
export const createExam = async (req, res, next) => {
  try {
    const { title, description, duration } = req.body;

    const exam = new Exam({
      title,
      description,
      duration,
      createdBy: req.user._id,
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active exams
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ isActive: true }).select('-__v');
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam by ID (including questions without answers if student)
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (exam) {
      // Find all questions associated with this exam
      const questions = await Question.find({ examId: exam._id });
      
      let formattedQuestions = questions;
      
      // If student, don't send the correct answers
      if (req.user.role === 'Student') {
        formattedQuestions = questions.map((q) => ({
          _id: q._id,
          text: q.text,
          options: q.options,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        }));
      }

      res.json({
        ...exam._doc,
        questions: formattedQuestions,
      });
    } else {
      res.status(404);
      throw new Error('Exam not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a question to an exam
// @route   POST /api/exams/:id/questions
// @access  Private/Teacher
export const addQuestion = async (req, res, next) => {
  try {
    const { text, options, correctAnswer, marks, negativeMarks } = req.body;

    const exam = await Exam.findById(req.params.id);

    if (exam) {
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to modify this exam');
      }

      const question = new Question({
        examId: exam._id,
        text,
        options,
        correctAnswer,
        marks: marks || 1,
        negativeMarks: negativeMarks || 0,
      });

      const createdQuestion = await question.save();
      res.status(201).json(createdQuestion);
    } else {
      res.status(404);
      throw new Error('Exam not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @route   PUT /api/exams/questions/:id
// @access  Private/Teacher
export const updateQuestion = async (req, res, next) => {
  try {
    const { text, options, correctAnswer, marks, negativeMarks } = req.body;
    const question = await Question.findById(req.params.id);

    if (question) {
      const exam = await Exam.findById(question.examId);
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to update this question');
      }

      question.text = text || question.text;
      question.options = options || question.options;
      question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
      question.marks = marks !== undefined ? marks : question.marks;
      question.negativeMarks = negativeMarks !== undefined ? negativeMarks : question.negativeMarks;

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/exams/questions/:id
// @access  Private/Teacher
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      const exam = await Exam.findById(question.examId);
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to delete this question');
      }

      await Question.findByIdAndDelete(req.params.id);
      res.json({ message: 'Question removed' });
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Update an exam
// @route   PUT /api/exams/:id
// @access  Private/Teacher
export const updateExam = async (req, res, next) => {
  try {
    const { title, description, duration, isActive } = req.body;

    const exam = await Exam.findById(req.params.id);

    if (exam) {
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to update this exam');
      }

      exam.title = title || exam.title;
      exam.description = description || exam.description;
      exam.duration = duration || exam.duration;
      if (isActive !== undefined) exam.isActive = isActive;

      const updatedExam = await exam.save();
      res.json(updatedExam);
    } else {
      res.status(404);
      throw new Error('Exam not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private/Teacher
export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (exam) {
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to delete this exam');
      }

      await Exam.findByIdAndDelete(req.params.id);
      res.json({ message: 'Exam removed' });
    } else {
      res.status(404);
      throw new Error('Exam not found');
    }
  } catch (error) {
    next(error);
  }
};
