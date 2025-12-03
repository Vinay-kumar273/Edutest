import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Batch, TestSeries, TestAttempt, UserProgress, PaidAccess, Enrollment, StudyMaterial } from '../types';

export const batchesCollection = collection(db, 'batches');
export const testSeriesCollection = collection(db, 'testSeries');
export const attemptsCollection = collection(db, 'attempts');
export const progressCollection = collection(db, 'progress');
export const paidAccessCollection = collection(db, 'paidAccess');
export const enrollmentsCollection = collection(db, 'enrollments');
export const studyMaterialsCollection = collection(db, 'studyMaterials');

export const getBatches = async (): Promise<Batch[]> => {
  try {
    const snapshot = await getDocs(query(batchesCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const snapshot = await getDocs(batchesCollection);
      const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
      return batches.sort((a, b) => b.createdAt - a.createdAt);
    }
    throw error;
  }
};

export const getBatch = async (id: string): Promise<Batch | null> => {
  const docSnap = await getDoc(doc(batchesCollection, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Batch;
};

export const createBatch = async (batch: Omit<Batch, 'id'>): Promise<string> => {
  const docRef = await addDoc(batchesCollection, batch);
  return docRef.id;
};

export const updateBatch = async (id: string, data: Partial<Batch>): Promise<void> => {
  await updateDoc(doc(batchesCollection, id), data);
};

export const deleteBatch = async (id: string): Promise<void> => {
  await deleteDoc(doc(batchesCollection, id));
};

export const getTestSeriesByBatch = async (batchId: string): Promise<TestSeries[]> => {
  try {
    const q = query(testSeriesCollection, where('batchId', '==', batchId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestSeries));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const q = query(testSeriesCollection, where('batchId', '==', batchId));
      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestSeries));
      return tests.sort((a, b) => b.createdAt - a.createdAt);
    }
    throw error;
  }
};

export const getTestSeries = async (id: string): Promise<TestSeries | null> => {
  const docSnap = await getDoc(doc(testSeriesCollection, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as TestSeries;
};

export const createTestSeries = async (testSeries: Omit<TestSeries, 'id'>): Promise<string> => {
  const docRef = await addDoc(testSeriesCollection, testSeries);
  return docRef.id;
};

export const updateTestSeries = async (id: string, data: Partial<TestSeries>): Promise<void> => {
  await updateDoc(doc(testSeriesCollection, id), data);
};

export const deleteTestSeries = async (id: string): Promise<void> => {
  await deleteDoc(doc(testSeriesCollection, id));
};

export const saveTestAttempt = async (attempt: Omit<TestAttempt, 'id'>): Promise<string> => {
  const docRef = await addDoc(attemptsCollection, attempt);
  return docRef.id;
};

export const getUserAttempts = async (userId: string): Promise<TestAttempt[]> => {
  try {
    const q = query(attemptsCollection, where('userId', '==', userId), orderBy('completedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const q = query(attemptsCollection, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
      return attempts.sort((a, b) => b.completedAt - a.completedAt);
    }
    throw error;
  }
};

export const getTestAttempt = async (id: string): Promise<TestAttempt | null> => {
  const docSnap = await getDoc(doc(attemptsCollection, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as TestAttempt;
};

export const getTestAttempts = async (testSeriesId: string): Promise<TestAttempt[]> => {
  try {
    const q = query(attemptsCollection, where('testSeriesId', '==', testSeriesId), orderBy('completedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const q = query(attemptsCollection, where('testSeriesId', '==', testSeriesId));
      const snapshot = await getDocs(q);
      const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
      return attempts.sort((a, b) => b.completedAt - a.completedAt);
    }
    throw error;
  }
};

export const checkPaidAccess = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    console.log('Checking paid access for user:', userId, 'batch:', batchId);
    const q = query(paidAccessCollection, where('userId', '==', userId), where('batchId', '==', batchId));
    const snapshot = await getDocs(q);

    console.log('Paid access query result - empty:', snapshot.empty, 'docs:', snapshot.docs.length);

    if (snapshot.empty) {
      console.log('No paid access found');
      return false;
    }

    const access = snapshot.docs[0].data() as PaidAccess;
    console.log('Paid access data:', access);

    if (access.expiresAt && access.expiresAt < Date.now()) {
      console.log('Paid access expired');
      return false;
    }

    console.log('User has valid paid access');
    return true;
  } catch (error) {
    console.error('Error checking paid access:', error);
    return false;
  }
};

export const grantPaidAccess = async (userId: string, batchId: string, expiresAt?: number): Promise<void> => {
  await addDoc(paidAccessCollection, {
    userId,
    batchId,
    grantedAt: Date.now(),
    expiresAt
  });
};

export const updateProgress = async (userId: string, batchId: string, testSeriesId: string): Promise<void> => {
  const progressId = `${userId}_${batchId}`;
  const progressRef = doc(progressCollection, progressId);

  const progressSnap = await getDoc(progressRef);

  if (progressSnap.exists()) {
    const currentProgress = progressSnap.data() as UserProgress;
    await updateDoc(progressRef, {
      completedTests: [...new Set([...currentProgress.completedTests, testSeriesId])],
      lastAccessedAt: Date.now()
    });
  } else {
    await setDoc(progressRef, {
      userId,
      batchId,
      completedTests: [testSeriesId],
      lastAccessedAt: Date.now()
    });
  }
};

export const getUserProgress = async (userId: string): Promise<UserProgress[]> => {
  const q = query(progressCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserProgress);
};

export const enrollInBatch = async (userId: string, batchId: string): Promise<void> => {
  const enrollmentId = `${userId}_${batchId}`;
  await setDoc(doc(enrollmentsCollection, enrollmentId), {
    userId,
    batchId,
    enrolledAt: Date.now()
  });
};

export const isEnrolledInBatch = async (userId: string, batchId: string): Promise<boolean> => {
  const enrollmentId = `${userId}_${batchId}`;
  const docSnap = await getDoc(doc(enrollmentsCollection, enrollmentId));
  return docSnap.exists();
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const q = query(enrollmentsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
};

export const unenrollFromBatch = async (userId: string, batchId: string): Promise<void> => {
  const enrollmentId = `${userId}_${batchId}`;
  await deleteDoc(doc(enrollmentsCollection, enrollmentId));
};

export const createStudyMaterial = async (material: Omit<StudyMaterial, 'id'>): Promise<string> => {
  const docRef = await addDoc(studyMaterialsCollection, material);
  return docRef.id;
};

export const getStudyMaterialsByBatch = async (batchId: string): Promise<StudyMaterial[]> => {
  try {
    const q = query(studyMaterialsCollection, where('batchId', '==', batchId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const q = query(studyMaterialsCollection, where('batchId', '==', batchId));
      const snapshot = await getDocs(q);
      const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));
      return materials.sort((a, b) => b.createdAt - a.createdAt);
    }
    throw error;
  }
};

export const deleteStudyMaterial = async (id: string): Promise<void> => {
  await deleteDoc(doc(studyMaterialsCollection, id));
};

export const coAdminsCollection = collection(db, 'coAdmins');

export const getCoAdmins = async (): Promise<CoAdmin[]> => {
  try {
    const snapshot = await getDocs(query(coAdminsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoAdmin));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const snapshot = await getDocs(coAdminsCollection);
      const coAdmins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoAdmin));
      return coAdmins.sort((a, b) => b.createdAt - a.createdAt);
    }
    throw error;
  }
};

export const addCoAdmin = async (coAdminData: { userId: string; email: string; name: string }): Promise<string> => {
  const docRef = await addDoc(coAdminsCollection, {
    ...coAdminData,
    role: 'co-admin',
    createdAt: Date.now()
  });
  return docRef.id;
};

export const removeCoAdmin = async (id: string): Promise<void> => {
  await deleteDoc(doc(coAdminsCollection, id));
};

export const isCoAdmin = async (userId: string): Promise<boolean> => {
  const q = query(coAdminsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0;
};
