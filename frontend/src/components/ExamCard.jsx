import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, PlayCircle, BarChart2 } from 'lucide-react';

const ExamCard = ({ exam, role, onAction }) => {
  return (
    <div className="bg-white rounded-xl shadow-premium hover:shadow-lg border border-gray-100 transition-all duration-300 p-6 flex flex-col h-full group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight">
          {exam.title}
        </h3>
        {role === 'Teacher' && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {exam.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3 mb-6">
        {exam.description || 'No description provided.'}
      </p>
      
      <div className="flex items-center text-sm text-gray-700 mb-6 bg-gray-50 p-3 rounded-lg w-max">
        <Clock size={16} className="mr-2 text-primary-500" />
        <span>Duration: {exam.duration} mins</span>
      </div>
      
      <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4">
        {role === 'Student' ? (
          <button
            onClick={() => onAction(exam._id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            <PlayCircle size={18} />
            Attempt Exam
          </button>
        ) : (
          <div className="flex flex-col gap-2 w-full">
             <button
              onClick={(e) => {
                e.stopPropagation();
                onAction(exam._id, 'view');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium text-sm"
            >
              <BarChart2 size={16} />
              Analytics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
