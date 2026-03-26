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
