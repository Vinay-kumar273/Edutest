import { useEffect, useState } from 'react';
import { Batch, TestSeries, StudyMaterial } from '../../types';
import { getTestSeriesByBatch, checkPaidAccess, isEnrolledInBatch, getStudyMaterialsByBatch } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Clock, Award, Lock, PlayCircle, Loader2, Download, FileText, Book, BookOpen } from 'lucide-react';

interface BatchDetailProps {
  batch: Batch;
  onBack: () => void;
  onStartTest: (testSeries: TestSeries) => void;
}

export const BatchDetail = ({ batch, onBack, onStartTest }: BatchDetailProps) => {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching tests for batch:', batch.id);
        const tests = await getTestSeriesByBatch(batch.id);
        console.log('Tests fetched:', tests.length, tests);
        setTestSeries(tests);

        const studyMaterials = await getStudyMaterialsByBatch(batch.id);
        setMaterials(studyMaterials);

        if (user) {
          const enrolled = await isEnrolledInBatch(user.uid, batch.id);
          console.log('Is enrolled:', enrolled);

          if (batch.type === 'Free') {
            setHasAccess(enrolled);
          } else {
            const paidAccess = await checkPaidAccess(user.uid, batch.id);
            console.log('Has paid access:', paidAccess);
            setHasAccess(enrolled && paidAccess);
          }
        }
      } catch (error) {
        console.error('Error fetching test series:', error);
        alert('Error loading tests. Check console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batch.id, batch.type, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Batches
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-64 overflow-hidden">
          <img
            src={batch.thumbnail}
            alt={batch.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                batch.type === 'Free'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {batch.type}
            </span>
          </div>
          <p className="text-gray-600 text-lg">{batch.description}</p>
        </div>
      </div>

      {!hasAccess && batch.type === 'Paid' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Access Required</h3>
              <p className="text-amber-800">
                This is a paid batch. Please contact the administrator to get access.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Materials</h2>

          {materials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No study materials available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => {
                const typeIcons: { [key: string]: any } = {
                  PDF: FileText,
                  Book: Book,
                  Notes: BookOpen,
                  Video: Download,
                  Other: Download
                };
                const IconComponent = typeIcons[material.type] || Download;

                return (
                  <div key={material.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{material.title}</h3>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {material.type}
                        </span>
                      </div>
                    </div>

                    {material.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{material.description}</p>
                    )}

                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <p>Size: {(material.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                      <p>By: {material.uploadedBy}</p>
                    </div>

                    <a
                      href={material.fileUrl}
                      download={material.fileName}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Series</h2>

          {testSeries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-gray-500 text-lg">No test series available yet.</p>
            </div>
          ) : (
            testSeries.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition mb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{test.name}</h3>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{test.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{test.questions.length} questions</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartTest(test)}
                    disabled={!hasAccess}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Test
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
