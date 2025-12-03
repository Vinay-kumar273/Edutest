import { useState, useEffect } from 'react';
import { getBatches, deleteBatch, updateBatch } from '../../services/firestore';
import { Batch } from '../../types';
import { Loader2, CreditCard as Edit, Trash2, Save, X } from 'lucide-react';

export const ManageBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Batch>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch.id);
    setEditForm({
      name: batch.name,
      description: batch.description,
      type: batch.type,
      imageUrl: batch.imageUrl
    });
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setEditForm({});
  };

  const handleSaveEdit = async (batchId: string) => {
    try {
      await updateBatch(batchId, editForm);
      await fetchBatches();
      setEditingBatch(null);
      setEditForm({});
      alert('Batch updated successfully!');
    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Failed to update batch');
    }
  };

  const handleDelete = async (batchId: string, batchName: string) => {
    if (!confirm(`Are you sure you want to delete "${batchName}"?\n\nThis will NOT delete associated tests and enrollments, but students may lose access to the batch.`)) {
      return;
    }

    setDeleting(batchId);
    try {
      await deleteBatch(batchId);
      await fetchBatches();
      alert('Batch deleted successfully!');
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch');
    } finally {
      setDeleting(null);
    }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Batches</h2>

      {batches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No batches found. Create a batch first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {editingBatch === batch.id ? (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={editForm.type || 'Free'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'Free' | 'Paid' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={editForm.imageUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(batch.id)}
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
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{batch.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          batch.type === 'Free'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {batch.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{batch.description}</p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                        title="Edit Batch"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id, batch.name)}
                        disabled={deleting === batch.id}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        title="Delete Batch"
                      >
                        {deleting === batch.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
