import { useEffect, useState, useRef } from 'react';
import { TestAttempt, TestSeries, Question } from '../../types';
import { getTestAttempt, getTestSeries } from '../../services/firestore';
import { Award, Clock, CheckCircle, XCircle, MinusCircle, Share2, ArrowLeft, Loader2, Eye, RefreshCw, ChevronDown, ChevronUp, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TestResultProps {
  attemptId: string;
  onBack: () => void;
  onShare?: () => void;
  onReattempt?: (testSeries: TestSeries) => void;
}

export const TestResult = ({ attemptId, onBack, onShare, onReattempt }: TestResultProps) => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptData = await getTestAttempt(attemptId);
        if (attemptData) {
          setAttempt(attemptData);
          const testData = await getTestSeries(attemptData.testSeriesId);
          setTestSeries(testData);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attemptId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getPercentage = () => {
    if (!attempt) return 0;
    return ((attempt.score / attempt.totalMarks) * 100).toFixed(2);
  };

  const handleShareResult = async () => {
    if (!resultCardRef.current || !attempt) return;

    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate image');
          setGeneratingImage(false);
          return;
        }

        const fileName = `test-result-${attemptId}.png`;

        if (navigator.share && navigator.canShare?.({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: `Test Result - ${attempt.testName}`,
              text: `I scored ${attempt.score}/${attempt.totalMarks} (${getPercentage()}%)`
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              downloadImage(blob, fileName);
            }
          }
        } else {
          downloadImage(blob, fileName);
        }

        setGeneratingImage(false);
        onShare?.();
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      setGeneratingImage(false);
    }
  };

  const downloadImage = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Result image downloaded successfully!');
  };

  const handleReattempt = () => {
    if (testSeries && onReattempt) {
      if (confirm('Are you sure you want to reattempt this test? Your current attempt will remain saved.')) {
        onReattempt(testSeries);
      }
    }
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const getQuestionStatus = (question: Question): 'correct' | 'wrong' | 'unanswered' => {
    if (!attempt) return 'unanswered';
    const userAnswer = attempt.answers[question.id];
    if (userAnswer === undefined) return 'unanswered';
    return userAnswer === question.correctOption ? 'correct' : 'wrong';
  };

  const getUserAnswer = (question: Question): number | undefined => {
    if (!attempt) return undefined;
    return attempt.answers[question.id];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!attempt || !testSeries) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Result not found</p>
      </div>
    );
  }

  const percentage = parseFloat(getPercentage());

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div ref={resultCardRef} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className={`p-8 text-center ${
            percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
            percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
            percentage >= 35 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <Award className="w-10 h-10 text-gray-800" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Test Completed!</h1>
            <p className="text-white text-lg opacity-90">{attempt.testName}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <p className="text-blue-800 font-semibold mb-2">Your Score</p>
                <p className="text-4xl font-bold text-blue-900">
                  {attempt.score}/{attempt.totalMarks}
                </p>
                <p className="text-blue-700 mt-2">{percentage}%</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <p className="text-gray-700 font-semibold mb-2">Time Taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  <p className="text-3xl font-bold text-gray-900">
                    {formatTime(attempt.timeTaken)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-green-800 font-semibold">Correct</p>
                </div>
                <p className="text-3xl font-bold text-green-900">{attempt.correctAnswers}</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-800 font-semibold">Wrong</p>
                </div>
                <p className="text-3xl font-bold text-red-900">{attempt.wrongAnswers}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <MinusCircle className="w-6 h-6 text-gray-600" />
                  <p className="text-gray-800 font-semibold">Unanswered</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{attempt.unanswered}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Answer Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Questions</p>
                  <p className="text-lg font-semibold text-gray-900">{testSeries.questions.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Attempted</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {attempt.correctAnswers + attempt.wrongAnswers}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Accuracy</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {attempt.correctAnswers + attempt.wrongAnswers > 0
                      ? ((attempt.correctAnswers / (attempt.correctAnswers + attempt.wrongAnswers)) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Completed On</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <Eye className="w-5 h-5" />
                {showSolutions ? 'Hide Solutions' : 'View Solutions'}
              </button>
              {onReattempt && (
                <button
                  onClick={handleReattempt}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reattempt Test
                </button>
              )}
              <button
                onClick={handleShareResult}
                disabled={generatingImage}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Share as Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {showSolutions && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Solutions</h2>

            <div className="space-y-4">
              {testSeries.questions.map((question, index) => {
                const status = getQuestionStatus(question);
                const userAnswer = getUserAnswer(question);
                const isExpanded = expandedQuestion === question.id;

                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-lg overflow-hidden ${
                      status === 'correct' ? 'border-green-300 bg-green-50' :
                      status === 'wrong' ? 'border-red-300 bg-red-50' :
                      'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-opacity-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        {status === 'correct' && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {status === 'wrong' && <XCircle className="w-6 h-6 text-red-600" />}
                        {status === 'unanswered' && <MinusCircle className="w-6 h-6 text-gray-600" />}
                        <span className="font-semibold text-gray-900">
                          Question {index + 1}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          status === 'correct' ? 'bg-green-200 text-green-800' :
                          status === 'wrong' ? 'bg-red-200 text-red-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Wrong' : 'Not Attempted'}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t-2 border-gray-200">
                        <div className="mb-4">
                          <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                          {question.questionImage && (
                            <img
                              src={question.questionImage}
                              alt="Question"
                              className="max-w-md rounded-lg border border-gray-300 mb-4"
                            />
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          {question.options.map((option) => {
                            const isCorrect = option.id === question.correctOption;
                            const isUserAnswer = option.id === userAnswer;

                            return (
                              <div
                                key={option.id}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrect ? 'border-green-500 bg-green-100' :
                                  isUserAnswer && !isCorrect ? 'border-red-500 bg-red-100' :
                                  'border-gray-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isCorrect && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                  {isUserAnswer && !isCorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{String.fromCharCode(65 + option.id)}.</span>
                                      <span>{option.text}</span>
                                      {isCorrect && (
                                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded ml-auto">
                                          Correct Answer
                                        </span>
                                      )}
                                      {isUserAnswer && !isCorrect && (
                                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded ml-auto">
                                          Your Answer
                                        </span>
                                      )}
                                    </div>
                                    {option.image && (
                                      <img
                                        src={option.image}
                                        alt={`Option ${option.id}`}
                                        className="mt-2 max-w-xs rounded border border-gray-300"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {status === 'unanswered' && (
                          <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                            <p className="text-gray-700 text-sm">
                              <strong>You did not attempt this question.</strong>
                            </p>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Marks:</strong> +{question.marks} for correct answer
                            {question.negativeMarks > 0 && `, -${question.negativeMarks} for wrong answer`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
