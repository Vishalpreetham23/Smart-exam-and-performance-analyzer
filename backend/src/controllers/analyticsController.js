import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import User from '../models/User.js';

// @desc    Get global analytics (Admin/Teacher)
// @route   GET /api/analytics
// @access  Private/Teacher
export const getGlobalAnalytics = async (req, res, next) => {
  try {
    const totalExams = await Exam.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalSubmissions = await Submission.countDocuments();

    res.json({
      totalExams,
      totalStudents,
      totalSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for a specific exam
// @route   GET /api/analytics/exam/:examId
// @access  Private/Teacher
export const getExamAnalytics = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || (req.user.role === 'Teacher' && exam.createdBy.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized for this exam analytics');
    }

    const submissions = await Submission.find({ examId: req.params.examId });

    if (submissions.length === 0) {
      return res.json({ message: 'No submissions yet for this exam' });
    }

    const totalStudentsAttempted = submissions.length;
    const passCount = submissions.filter(sub => sub.passed).length;
    const passPercentage = (passCount / totalStudentsAttempted) * 100;
    
    const averageScore = submissions.reduce((acc, sub) => acc + sub.score, 0) / totalStudentsAttempted;
    const averagePercentage = submissions.reduce((acc, sub) => acc + sub.percentage, 0) / totalStudentsAttempted;

    const highestScore = Math.max(...submissions.map(sub => sub.score));
    const lowestScore = Math.min(...submissions.map(sub => sub.score));

    // Top 5 rankers
    const leaderboard = await Submission.find({ examId: req.params.examId })
      .sort({ score: -1, timeTaken: 1 })
      .limit(5)
      .populate('studentId', 'name email');

    res.json({
      totalStudentsAttempted,
      passCount,
      passPercentage,
      averageScore,
      averagePercentage,
      highestScore,
      lowestScore,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
