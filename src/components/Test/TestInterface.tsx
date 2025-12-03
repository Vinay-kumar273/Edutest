import { useState, useEffect } from 'react';
import { TestSeries, Question } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { saveTestAttempt, updateProgress } from '../../services/firestore';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

interface TestInterfaceProps {
  testSeries: TestSeries;
  batchId: string;
  onComplete: (attemptId: string) => void;
  onExit: () => void;
}

export const TestInterface = ({ testSeries, batchId, onComplete, onExit }: TestInterfaceProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(testSeries.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitting]);

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    testSeries.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined) {
        if (userAnswer === q.correctOption) {
          score += q.marks;
          correctAnswers++;
        } else {
          score -= q.negativeMarks || 0;
          wrongAnswers++;
        }
      }
    });

    return {
      score,
      correctAnswers,
      wrongAnswers,
      unanswered: testSeries.questions.length - correctAnswers - wrongAnswers
    };
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = testSeries.questions.length;
    const unansweredCount = totalQuestions - answeredCount;

    const message = unansweredCount > 0
      ? `You have answered ${answeredCount} out of ${totalQuestions} questions.\n${unansweredCount} question(s) are unanswered.\n\nAre you sure you want to submit?`
      : `You have answered all ${totalQuestions} questions.\n\nAre you sure you want to submit?`;

    if (confirm(message)) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user) return;
    setIsSubmitting(true);

    const timeTaken = testSeries.duration * 60 - timeLeft;
    const result = calculateScore();

    try {
      const attemptId = await saveTestAttempt({
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        testSeriesId: testSeries.id,
        batchId,
        testName: testSeries.name,
        answers,
        ...result,
        totalMarks: testSeries.totalMarks,
        timeTaken,
        completedAt: Date.now()
      });

      await updateProgress(user.uid, batchId, testSeries.id);
      onComplete(attemptId);
    } catch (error: any) {
      console.error('Error submitting test:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to submit test: ${errorMessage}\n\nPlease ensure Firestore rules are deployed in your Firebase Console.`);
      setIsSubmitting(false);
    }
  };

  const question = testSeries.questions[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{testSeries.name}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {testSeries.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-blue-600">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Question {currentQuestion + 1}
                    </h2>
                    {question.type === 'integer' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        INTEGER
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {question.marks} mark{question.marks > 1 ? 's' : ''}
                    {question.negativeMarks && ` | -${question.negativeMarks} for wrong`}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-800 text-lg mb-4">{question.question}</p>
                  {question.questionImage && question.questionImage.trim() !== '' && (
                    <img
                      src={question.questionImage}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg mb-4"
                    />
                  )}
                </div>
              </div>

              {question.type === 'integer' ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your answer (integer value only):
                  </label>
                  <input
                    type="number"
                    value={answers[question.id] !== undefined ? answers[question.id] : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        const newAnswers = { ...answers };
                        delete newAnswers[question.id];
                        setAnswers(newAnswers);
                      } else {
                        handleAnswer(question.id, parseInt(value));
                      }
                    }}
                    placeholder="Enter integer value"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {answers[question.id] !== undefined && (
                    <p className="text-sm text-green-600">✓ Answer recorded</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(question.id, option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        answers[question.id] === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            answers[question.id] === option.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {answers[question.id] === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{option.text}</p>
                          {option.image && option.image.trim() !== '' && (
                            <img
                              src={option.image}
                              alt="Option"
                              className="mt-2 max-w-xs h-auto rounded"
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(testSeries.questions.length - 1, prev + 1)
                    )
                  }
                  disabled={currentQuestion === testSeries.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {testSeries.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[q.id] !== undefined
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-green-100 border-2 border-green-500" />
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-100" />
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-600" />
                  <span className="text-gray-600">Current</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(answers).length}/{testSeries.questions.length}
                  </p>
                  <p className="text-sm text-gray-600">Questions Answered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
