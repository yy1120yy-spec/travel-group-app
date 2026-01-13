'use client';

import { useState } from 'react';
import { doc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { MessageFormData } from '@/types/message';
import { getMessagesRef, addDocument } from '@/lib/firebase/firestore';
import { uploadChatImage } from '@/lib/firebase/storage';

export const useMessageActions = (groupId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const sendMessage = async (formData: MessageFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const messagesRef = getMessagesRef(groupId);
      const messageData = {
        groupId,
        content: formData.content,
        type: formData.type,
        author: formData.author,
        isEdited: false,
        readBy: [formData.author],
        imageUrl: formData.imageUrl,
        imageMetadata: formData.imageMetadata,
      };

      const messageId = await addDocument(messagesRef, messageData);
      setLoading(false);
      return messageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메시지 전송 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const sendImageMessage = async (
    file: File,
    author: string
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('이미지 크기는 5MB 이하여야 합니다');
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다');
      }

      setUploadProgress(50);

      // Firebase Storage에 업로드
      const { url } = await uploadChatImage(groupId, author, file);

      setUploadProgress(75);

      // 이미지 메시지 생성
      const messageId = await sendMessage({
        content: '',
        type: 'image',
        author,
        imageUrl: url,
        imageMetadata: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      });

      setUploadProgress(100);
      setLoading(false);
      return messageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드 실패';
      setError(errorMessage);
      setLoading(false);
      setUploadProgress(0);
      throw new Error(errorMessage);
    }
  };

  const editMessage = async (
    messageId: string,
    newContent: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const messageRef = doc(getMessagesRef(groupId), messageId);
      await setDoc(
        messageRef,
        {
          content: newContent,
          isEdited: true,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메시지 수정 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const messageRef = doc(getMessagesRef(groupId), messageId);
      await deleteDoc(messageRef);

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메시지 삭제 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    loading,
    error,
    uploadProgress,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
  };
};
