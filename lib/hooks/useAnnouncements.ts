'use client';

import { useState, useEffect } from 'react';
import { Timestamp, doc, orderBy, deleteDoc, setDoc } from 'firebase/firestore';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import {
  getAnnouncementsRef,
  addDocument,
  subscribeToCollection,
} from '@/lib/firebase/firestore';

export const useAnnouncements = (groupId: string) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const announcementsRef = getAnnouncementsRef(groupId);
    const unsubscribe = subscribeToCollection(
      announcementsRef,
      (data) => {
        // 고정된 공지를 먼저, 그 다음 최신순
        const sorted = (data as Announcement[]).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt.seconds - a.createdAt.seconds;
        });
        setAnnouncements(sorted);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, [groupId]);

  return { announcements, loading };
};

export const useAnnouncementActions = (groupId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAnnouncement = async (formData: AnnouncementFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const announcementsRef = getAnnouncementsRef(groupId);
      const announcementData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        isPinned: formData.isPinned || false,
      };

      const announcementId = await addDocument(announcementsRef, announcementData);
      setLoading(false);
      return announcementId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '공지 추가 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const togglePin = async (announcementId: string, isPinned: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const announcementRef = doc(getAnnouncementsRef(groupId), announcementId);
      await setDoc(announcementRef, { isPinned }, { merge: true });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '고정 변경 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteAnnouncement = async (announcementId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const announcementRef = doc(getAnnouncementsRef(groupId), announcementId);
      await deleteDoc(announcementRef);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '공지 삭제 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    loading,
    error,
    addAnnouncement,
    togglePin,
    deleteAnnouncement,
  };
};
