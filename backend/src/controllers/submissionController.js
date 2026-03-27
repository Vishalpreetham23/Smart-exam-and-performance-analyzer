import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

// @desc    Submit an exam
// @route   POST /api/submissions/:examId
// @access  Private/Student
export const submitExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { answers, timeTaken } = req.body;

    if (req.user.role !== 'Student') {
      res.status(403);
      throw new Error('Only students can submit exams');
    }

    if (!Array.isArray(answers)) {
      res.status(400);
      throw new Error('Answers must be an array');
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }

    // Check if user already submitted this exam (prevent re-attempts)
    const existingSubmission = await Submission.findOne({
      studentId: req.user._id,
      examId: exam._id,
    });

    if (existingSubmission) {
      res.status(400);
      throw new Error('Exam already submitted');
    }

    // Evaluate answers
    let score = 0;
    let totalMarks = 0;
    
    // Fetch all questions for this exam to compare answers
    const questions = await Question.find({ examId });
    
    // Map to make lookup easier O(1)
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
      totalMarks += q.marks;
    });

    const evaluatedAnswers = answers.map((ans) => {
      const q = questionMap[ans.questionId];
      if (!q) return ans; // skip invalid questions
      
      if (ans.selectedOption === q.correctAnswer) {
        score += q.marks;
      } else if (ans.selectedOption !== null) {
        // Apply negative marking if implemented and attempted
        score -= q.negativeMarks;
      }
      return ans;
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passed = percentage >= 40; // 40% passing criteria

    const submission = new Submission({
      studentId: req.user._id,
      examId: exam._id,
      answers: evaluatedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      timeTaken,
    });

    const createdSubmission = await submission.save();

    res.status(201).json(createdSubmission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my
// @access  Private
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('examId', 'title duration')
      .sort({ createdAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for an exam
// @route   GET /api/submissions/exam/:examId
// @access  Private/Teacher
export const getExamSubmissions = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    
    if (exam && (exam.createdBy.toString() === req.user._id.toString() || req.user.role === 'Admin')) {
      const submissions = await Submission.find({ examId: req.params.examId })
        .populate('studentId', 'name email')
        .sort({ score: -1 }); // sort by score highest to lowest (Leaderboard)

      res.json(submissions);
    } else {
      res.status(403);
      throw new Error('Not authorized to view these submissions');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('examId', 'title duration createdBy');

    if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
    }

    const isStudentOwner = submission.studentId?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    const isTeacherOwner =
      req.user.role === 'Teacher' &&
      submission.examId?.createdBy?.toString() === req.user._id.toString();

    if (!isStudentOwner && !isAdmin && !isTeacherOwner) {
      res.status(403);
      throw new Error('Not authorized to view this submission');
    }

    res.json(submission);
  } catch (error) {
    next(error);
  }
};
