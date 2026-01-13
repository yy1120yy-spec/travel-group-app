import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './config';

export const storage = getStorage(app);

// 채팅 이미지 저장 경로 생성
export const getChatImagePath = (groupId: string, userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `groups/${groupId}/chat-images/${timestamp}_${userId}_${sanitizedFileName}`;
};

// 이미지 업로드 및 URL 반환
export const uploadChatImage = async (
  groupId: string,
  userId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const path = getChatImagePath(groupId, userId, file.name);
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path };
};

// 이미지 삭제
export const deleteChatImage = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
