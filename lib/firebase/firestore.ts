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
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';

// 그룹 관련 유틸리티
export const groupsCollection = collection(db, 'groups');

export const getGroupRef = (groupId: string) => doc(db, 'groups', groupId);

export const getGroup = async (groupId: string) => {
  const groupRef = getGroupRef(groupId);
  const groupSnap = await getDoc(groupRef);
  return groupSnap.exists() ? { id: groupSnap.id, ...groupSnap.data() } : null;
};

// 서브컬렉션 헬퍼
export const getSubCollection = (groupId: string, subCollectionName: string) => {
  return collection(db, 'groups', groupId, subCollectionName);
};

// 스케줄 관련
export const getSchedulesRef = (groupId: string) => getSubCollection(groupId, 'schedules');

// 공지사항 관련
export const getAnnouncementsRef = (groupId: string) => getSubCollection(groupId, 'announcements');

// 투표 관련
export const getVotesRef = (groupId: string) => getSubCollection(groupId, 'votes');

// 메뉴 관련
export const getMenusRef = (groupId: string) => getSubCollection(groupId, 'menus');

// 범용 CRUD 헬퍼
export const addDocument = async (collectionRef: any, data: any) => {
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateDocument = async (docRef: any, data: any) => {
  await updateDoc(docRef, data);
};

export const deleteDocument = async (docRef: any) => {
  await deleteDoc(docRef);
};

// 실시간 리스너
export const subscribeToCollection = (
  collectionRef: any,
  callback: (data: DocumentData[]) => void,
  ...queryConstraints: QueryConstraint[]
) => {
  const q = query(collectionRef, ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};

export const subscribeToDocument = (
  docRef: any,
  callback: (data: DocumentData | null) => void
) => {
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};
