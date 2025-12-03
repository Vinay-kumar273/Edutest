import { useState, useEffect } from 'react';
import { getBatches, getTestSeriesByBatch, deleteTestSeries, updateTestSeries } from '../../services/firestore';
import { Batch, TestSeries } from '../../types';
import { Loader2, CreditCard as Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

export const ManageTests = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [tests, setTests] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TestSeries>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getBatches();
        setBatches(data);
      } catch (error) {
        console.error('Error fetching batches:', error);
        alert('Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchTests();
    }
  }, [selectedBatch]);

  const fetchTests = async () => {
    if (!selectedBatch) return;

    setLoadingTests(true);
    try {
      const data = await getTestSeriesByBatch(selectedBatch);
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests');
    } finally {
      setLoadingTests(false);
    }
  };

  const handleEdit = (test: TestSeries) => {
    setEditingTest(test.id);
    setEditForm({
      name: test.name,
      duration: test.duration,
      totalMarks: test.totalMarks
    });
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
    setEditForm({});
  };

  const handleSaveEdit = async (testId: string) => {
    try {
      await updateTestSeries(testId, editForm);
      await fetchTests();
      setEditingTest(null);
      setEditForm({});
      alert('Test updated successfully!');
    } catch (error) {
      console.error('Error updating test:', error);
      alert('Failed to update test');
    }
  };

  const handleDelete = async (testId: string, testName: string) => {
    if (!confirm(`Are you sure you want to delete "${testName}"?\n\nThis will also delete all student attempts for this test. This action cannot be undone.`)) {
      return;
    }

    setDeleting(testId);
    try {
      await deleteTestSeries(testId);
      await fetchTests();
      alert('Test deleted successfully!');
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    } finally {
      setDeleting(null);
    }
  };

  const toggleTestExpand = (testId: string) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Test Series</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Choose a batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name} ({batch.type})
            </option>
          ))}
        </select>
      </div>

      {selectedBatch && (
        <>
          {loadingTests ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No tests found in this batch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {editingTest === test.id ? (
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.duration || 0}
                            onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Marks
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.totalMarks || 0}
                            onChange={(e) => setEditForm({ ...editForm, totalMarks: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveEdit(test.id)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Duration: {test.duration} minutes</span>
                              <span>Total Marks: {test.totalMarks}</span>
                              <span>Questions: {test.questions.length}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Created: {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleTestExpand(test.id)}
                              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition"
                              title="View Questions"
                            >
                              {expandedTest === test.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(test)}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                              title="Edit Test"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(test.id, test.name)}
                              disabled={deleting === test.id}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                              title="Delete Test"
                            >
                              {deleting === test.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedTest === test.id && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                          <h4 className="font-semibold text-gray-900 mb-4">Questions Preview</h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {test.questions.map((q, index) => (
                              <div key={q.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="font-medium text-gray-900 mb-2">
                                  {index + 1}. {q.question}
                                </p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  {q.options.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className={opt.id === q.correctOption ? 'text-green-600 font-semibold' : ''}
                                    >
                                      {String.fromCharCode(65 + opt.id)}. {opt.text}
                                      {opt.id === q.correctOption && ' ✓'}
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Marks: +{q.marks} | Negative: -{q.negativeMarks || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
