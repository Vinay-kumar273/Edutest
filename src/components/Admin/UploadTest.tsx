import { useState, useEffect } from 'react';
import { getBatches, createTestSeries } from '../../services/firestore';
import { Batch, Question } from '../../types';
import { Loader2, Upload, FileJson, Table, PlusCircle } from 'lucide-react';

type UploadMethod = 'json' | 'csv' | 'manual';

export const UploadTest = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState(180);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('json');
  const [jsonContent, setJsonContent] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [manualQuestions, setManualQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const data = await getBatches();
      setBatches(data);
    };
    fetchBatches();
  }, []);

  const parseCSV = (csv: string): Question[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least header and one data row');

    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 8) {
        throw new Error(`Line ${i + 1} is incomplete. Expected at least 8 columns.`);
      }

      const [id, question, opt1, opt2, opt3, opt4, correctOption, marks, negativeMarks = '0'] = parts;

      questions.push({
        id: id || `q${i}`,
        question,
        options: [
          { id: 0, text: opt1 },
          { id: 1, text: opt2 },
          { id: 2, text: opt3 },
          { id: 3, text: opt4 }
        ],
        correctOption: parseInt(correctOption),
        marks: parseInt(marks),
        negativeMarks: negativeMarks ? parseInt(negativeMarks) : 0
      });
    }

    return questions;
  };

  const addManualQuestion = () => {
    const newQuestion: Question = {
      id: `q${manualQuestions.length + 1}`,
      question: '',
      questionImage: '',
      options: [
        { id: 0, text: '', image: '' },
        { id: 1, text: '', image: '' },
        { id: 2, text: '', image: '' },
        { id: 3, text: '', image: '' }
      ],
      correctOption: 0,
      marks: 4,
      negativeMarks: 1
    };
    setManualQuestions([...manualQuestions, newQuestion]);
  };

  const updateManualQuestion = (index: number, field: string, value: any) => {
    const updated = [...manualQuestions];
    if (field.startsWith('optionImage')) {
      const optionIndex = parseInt(field.replace('optionImage', ''));
      updated[index].options[optionIndex].image = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''));
      updated[index].options[optionIndex].text = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setManualQuestions(updated);
  };

  const removeManualQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let questions: Question[] = [];

      if (uploadMethod === 'json') {
        questions = JSON.parse(jsonContent);
      } else if (uploadMethod === 'csv') {
        questions = parseCSV(csvContent);
      } else if (uploadMethod === 'manual') {
        questions = manualQuestions.filter(q => q.question.trim() !== '');
        if (questions.length === 0) {
          throw new Error('Please add at least one question');
        }
      }

      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      await createTestSeries({
        batchId: selectedBatch,
        name: testName,
        duration,
        totalMarks,
        questions,
        createdAt: Date.now()
      });

      setSuccess(true);
      setTestName('');
      setDuration(180);
      setJsonContent('');
      setCsvContent('');
      setManualQuestions([]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error creating test series:', error);
      alert(`Failed to create test series: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exampleJson = `[
  {
    "id": "q1",
    "question": "What is the derivative of x^2?",
    "questionImage": "https://example.com/image.png",
    "options": [
      { "id": 0, "text": "2x", "image": "" },
      { "id": 1, "text": "x", "image": "" },
      { "id": 2, "text": "x^2", "image": "" },
      { "id": 3, "text": "2", "image": "" }
    ],
    "correctOption": 0,
    "marks": 4,
    "negativeMarks": 1
  },
  {
    "id": "q2",
    "question": "Solve for x: 2x + 5 = 13",
    "options": [
      { "id": 0, "text": "3" },
      { "id": 1, "text": "4" },
      { "id": 2, "text": "5" },
      { "id": 3, "text": "6" }
    ],
    "correctOption": 1,
    "marks": 4,
    "negativeMarks": 1
  }
]`;

  const exampleCSV = `id,question,option1,option2,option3,option4,correctOption,marks,negativeMarks
q1,What is 2+2?,3,4,5,6,1,4,1
q2,Capital of France?,London,Paris,Berlin,Rome,1,4,1`;

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Test Series</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Test series uploaded successfully!
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Method
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setUploadMethod('json')}
            className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
              uploadMethod === 'json'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileJson className="w-8 h-8" />
            <span className="font-semibold">JSON Format</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('csv')}
            className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
              uploadMethod === 'csv'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Table className="w-8 h-8" />
            <span className="font-semibold">CSV Format</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('manual')}
            className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
              uploadMethod === 'manual'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <PlusCircle className="w-8 h-8" />
            <span className="font-semibold">Manual Entry</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Batch
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
                {batch.name} ({batch.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Name
          </label>
          <input
            type="text"
            required
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Physics Mock Test 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            required
            min="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {uploadMethod === 'json' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions JSON
            </label>
            <textarea
              required
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              placeholder={exampleJson}
            />
            <p className="text-sm text-gray-600 mt-2">
              Upload questions in JSON format. Images are optional. Options can be integers or text.
            </p>
          </div>
        )}

        {uploadMethod === 'csv' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions CSV
            </label>
            <textarea
              required
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              placeholder={exampleCSV}
            />
            <p className="text-sm text-gray-600 mt-2">
              Format: id, question, option1, option2, option3, option4, correctOption (0-3), marks, negativeMarks<br/>
              Options can be integers or text. CSV format does not support images (use JSON for images).
            </p>
          </div>
        )}

        {uploadMethod === 'manual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Questions ({manualQuestions.length})
              </label>
              <button
                type="button"
                onClick={addManualQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {manualQuestions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeManualQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateManualQuestion(index, 'question', e.target.value)}
                  placeholder="Enter question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="url"
                  value={q.questionImage || ''}
                  onChange={(e) => updateManualQuestion(index, 'questionImage', e.target.value)}
                  placeholder="Question image URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />

                <div className="space-y-3">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={q.correctOption === optIndex}
                          onChange={() => updateManualQuestion(index, 'correctOption', optIndex)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateManualQuestion(index, `option${optIndex}`, e.target.value)}
                          placeholder={`Option ${optIndex + 1} (integer or text)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <input
                        type="url"
                        value={opt.image || ''}
                        onChange={(e) => updateManualQuestion(index, `optionImage${optIndex}`, e.target.value)}
                        placeholder="Option image URL (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ml-6"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Marks</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => updateManualQuestion(index, 'marks', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Negative Marks</label>
                    <input
                      type="number"
                      value={q.negativeMarks}
                      onChange={(e) => updateManualQuestion(index, 'negativeMarks', parseInt(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {manualQuestions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Click "Add Question" to start creating questions manually
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? 'Uploading...' : 'Upload Test Series'}
        </button>
      </form>

      {uploadMethod === 'json' && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">JSON Format Example</h3>
          <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
            {exampleJson}
          </pre>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Field Descriptions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>questionImage</strong>: Optional image URL for the question</li>
              <li><strong>options.text</strong>: Can be integer (e.g., "4") or text (e.g., "Paris")</li>
              <li><strong>options.image</strong>: Optional image URL for each option</li>
              <li><strong>correctOption</strong>: Index (0-3) of the correct answer</li>
            </ul>
          </div>
        </div>
      )}

      {uploadMethod === 'csv' && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">CSV Format Example</h3>
          <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
            {exampleCSV}
          </pre>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Notes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>correctOption</strong>: Should be 0-3 representing the index of the correct option</li>
              <li><strong>Options</strong>: Can be integers or text values</li>
              <li><strong>Images</strong>: Not supported in CSV format. Use JSON format if you need images.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
