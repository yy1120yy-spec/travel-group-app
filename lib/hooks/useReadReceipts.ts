'use client';

import { useEffect, useCallback, useRef } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessagesRef } from '@/lib/firebase/firestore';

export const useReadReceipts = (
  groupId: string,
  userName: string,
  messageIds: string[]
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedIds = useRef<Set<string>>(new Set());

  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!groupId || !userName || !messageId) return;
      if (processedIds.current.has(messageId)) return;

      try {
        const messageRef = doc(getMessagesRef(groupId), messageId);
        await updateDoc(messageRef, {
          readBy: arrayUnion(userName),
        });

        processedIds.current.add(messageId);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    },
    [groupId, userName]
  );

  // 1초 디바운스로 읽음 처리
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      messageIds.forEach((id) => {
        markAsRead(id);
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [messageIds, markAsRead]);

  return { markAsRead };
};
