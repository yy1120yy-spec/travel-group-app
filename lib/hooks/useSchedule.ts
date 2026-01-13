'use client';

import { useState, useEffect } from 'react';
import { Timestamp, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { Schedule, ScheduleFormData } from '@/types/schedule';
import {
  getSchedulesRef,
  addDocument,
  updateDocument,
  subscribeToCollection,
} from '@/lib/firebase/firestore';

export const useSchedules = (groupId: string) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const schedulesRef = getSchedulesRef(groupId);
    const unsubscribe = subscribeToCollection(
      schedulesRef,
      (data) => {
        // 클라이언트 사이드에서 날짜와 시간으로 정렬
        const sorted = (data as Schedule[]).sort((a, b) => {
          const dateCompare = a.date.seconds - b.date.seconds;
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });
        setSchedules(sorted);
        setLoading(false);
      },
      orderBy('date', 'asc')
    );

    return () => unsubscribe();
  }, [groupId]);

  return { schedules, loading };
};

export const useScheduleActions = (groupId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSchedule = async (formData: ScheduleFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const schedulesRef = getSchedulesRef(groupId);
      const scheduleData = {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(formData.date),
        time: formData.time,
        location: formData.location,
        type: formData.type,
        notificationTime: formData.notificationTime,
      };

      const scheduleId = await addDocument(schedulesRef, scheduleData);
      setLoading(false);
      return scheduleId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일정 추가 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const updateSchedule = async (
    scheduleId: string,
    formData: Partial<ScheduleFormData>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const scheduleRef = doc(getSchedulesRef(groupId), scheduleId);
      const updateData: any = { ...formData };

      if (formData.date) {
        updateData.date = Timestamp.fromDate(formData.date);
      }

      await updateDocument(scheduleRef, updateData);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일정 수정 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const scheduleRef = doc(getSchedulesRef(groupId), scheduleId);
      await deleteDoc(scheduleRef);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일정 삭제 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
};
