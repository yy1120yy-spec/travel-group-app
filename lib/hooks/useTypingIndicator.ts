'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { getTypingStatusRef } from '@/lib/firebase/firestore';
import { TypingStatus } from '@/types/message';

const TYPING_TIMEOUT = 3000; // 3초
const DEBOUNCE_DELAY = 300; // 300ms

export const useTypingIndicator = (groupId: string, userName: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 타이핑 상태 구독
  useEffect(() => {
    if (!groupId) return;

    const typingRef = getTypingStatusRef(groupId);

    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const now = Timestamp.now();
      const activeTypers: string[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as TypingStatus;
        const timeDiff = now.seconds - data.lastTyping.seconds;

        // 3초 이내에 타이핑한 사용자만 표시
        if (timeDiff < TYPING_TIMEOUT / 1000 && data.userName !== userName) {
          activeTypers.push(data.userName);
        }
      });

      setTypingUsers(activeTypers);
    });

    return () => unsubscribe();
  }, [groupId, userName]);

  // 타이핑 시작
  const startTyping = useCallback(async () => {
    if (!groupId || !userName) return;

    // 디바운스 타이머 클리어
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const typingRef = doc(getTypingStatusRef(groupId), userName);
        await setDoc(typingRef, {
          userName,
          groupId,
          lastTyping: serverTimestamp(),
        });

        // 3초 후 자동 삭제
        if (clearTimerRef.current) {
          clearTimeout(clearTimerRef.current);
        }

        clearTimerRef.current = setTimeout(async () => {
          try {
            await deleteDoc(typingRef);
          } catch (error) {
            console.error('Failed to clear typing status:', error);
          }
        }, TYPING_TIMEOUT);
      } catch (error) {
        console.error('Failed to update typing status:', error);
      }
    }, DEBOUNCE_DELAY);
  }, [groupId, userName]);

  // 타이핑 종료
  const stopTyping = useCallback(async () => {
    if (!groupId || !userName) return;

    // 타이머 클리어
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    try {
      const typingRef = doc(getTypingStatusRef(groupId), userName);
      await deleteDoc(typingRef);
    } catch (error) {
      console.error('Failed to stop typing status:', error);
    }
  }, [groupId, userName]);

  // 컴포넌트 언마운트 시 타이핑 상태 제거
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};
