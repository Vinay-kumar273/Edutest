export interface Batch {
  id: string;
  name: string;
  thumbnail: string;
  type: 'Free' | 'Paid';
  description: string;
  createdAt: number;
}

export interface TestSeries {
  id: string;
  batchId: string;
  name: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  createdAt: number;
}

export interface Question {
  id: string;
  question: string;
  questionImage?: string;
  options: Option[];
  correctOption: number;
  marks: number;
  negativeMarks?: number;
}

export interface Option {
  id: number;
  text: string;
  image?: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  testSeriesId: string;
  batchId: string;
  testName: string;
  answers: { [questionId: string]: number };
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTaken: number;
  completedAt: number;
}

export interface UserProgress {
  userId: string;
  batchId: string;
  completedTests: string[];
  lastAccessedAt: number;
}

export interface PaidAccess {
  userId: string;
  batchId: string;
  grantedAt: number;
  expiresAt?: number;
}

export interface Enrollment {
  id?: string;
  userId: string;
  batchId: string;
  enrolledAt: number;
}

export interface StudyMaterial {
  id: string;
  batchId: string;
  type: 'PDF' | 'Book' | 'Notes' | 'Video' | 'Other';
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: number;
}

export interface CoAdmin {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'co-admin';
  createdAt: number;
}
