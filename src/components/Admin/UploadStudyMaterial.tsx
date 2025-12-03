import { useState, useEffect } from 'react';
import { getBatches, createStudyMaterial } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Batch } from '../../types';
import { Upload, Loader2, FileText, Book, BookOpen } from 'lucide-react';

export const UploadStudyMaterial = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [materialType, setMaterialType] = useState<'PDF' | 'Book' | 'Notes' | 'Video' | 'Other'>('PDF');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const maxSize = 50 * 1024 * 1024;

      if (selectedFile.size > maxSize) {
        alert('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBatch || !title || !file || !user) {
      alert('Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      const fileUrl = URL.createObjectURL(file);

      await createStudyMaterial({
        batchId: selectedBatch,
        type: materialType,
        title,
        description,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: user.displayName || user.email || 'Admin',
        createdAt: Date.now()
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setFile(null);
      setMaterialType('PDF');
      setSelectedBatch('');

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload study material');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const typeIcons = {
    PDF: FileText,
    Book: Book,
    Notes: BookOpen,
    Video: Upload,
    Other: Upload
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Study Material</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Study material uploaded successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Batch <span className="text-red-600">*</span>
          </label>
          <select
            required
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material Type <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['PDF', 'Book', 'Notes', 'Video', 'Other'] as const).map((type) => {
              const IconComponent = typeIcons[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMaterialType(type)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                    materialType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mathematics Chapter 1 Notes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description about this material..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File <span className="text-red-600">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              type="file"
              required
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.pptx,.zip"
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span className="text-xs text-gray-500">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max file size: 50MB'}
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Material
            </>
          )}
        </button>
      </form>
    </div>
  );
};
