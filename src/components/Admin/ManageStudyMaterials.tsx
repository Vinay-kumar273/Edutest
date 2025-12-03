import { useState, useEffect } from 'react';
import { getBatches, getStudyMaterialsByBatch, deleteStudyMaterial } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Batch, StudyMaterial } from '../../types';
import { Loader2, Trash2, Download, FileText, Book, BookOpen, Link as LinkIcon } from 'lucide-react';

export const ManageStudyMaterials = () => {
  const { isAdmin } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
      fetchMaterials();
    }
  }, [selectedBatch]);

  const fetchMaterials = async () => {
    if (!selectedBatch) return;

    setLoadingMaterials(true);
    try {
      const data = await getStudyMaterialsByBatch(selectedBatch);
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      alert('Failed to load study materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDelete = async (materialId: string, materialTitle: string) => {
    if (!isAdmin) {
      alert('Only admins can delete materials');
      return;
    }

    if (!confirm(`Delete "${materialTitle}"?`)) {
      return;
    }

    setDeleting(materialId);
    try {
      await deleteStudyMaterial(materialId);
      await fetchMaterials();
      alert('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    } finally {
      setDeleting(null);
    }
  };

  const typeIcons = {
    PDF: FileText,
    Book: Book,
    Notes: BookOpen,
    Video: LinkIcon,
    Other: LinkIcon
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Study Materials</h2>

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
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBatch && (
        <>
          {loadingMaterials ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No study materials in this batch yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => {
                const IconComponent = typeIcons[material.type];
                return (
                  <div key={material.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{material.title}</h3>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {material.type}
                              </span>
                            </div>

                            {material.description && (
                              <p className="text-gray-600 text-sm mb-3">{material.description}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>File: {material.fileName}</span>
                              <span>Size: {formatFileSize(material.fileSize)}</span>
                              <span>Uploaded by: {material.uploadedBy}</span>
                              <span>Date: {new Date(material.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <a
                              href={material.fileUrl}
                              download={material.fileName}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                              title="Download Material"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(material.id, material.title)}
                                disabled={deleting === material.id}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                title="Delete Material"
                              >
                                {deleting === material.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
