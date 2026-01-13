'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Message } from '@/types/message';
import { getMessagesRef } from '@/lib/firebase/firestore';

const MESSAGES_PER_PAGE = 50;

export const useMessages = (groupId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestDoc, setOldestDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // 실시간 구독: 최근 50개 메시지
  useEffect(() => {
    if (!groupId) return;

    const messagesRef = getMessagesRef(groupId);
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(MESSAGES_PER_PAGE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];

      snapshot.forEach((doc) => {
        newMessages.push({
          id: doc.id,
          ...(doc.data() as Omit<Message, 'id'>),
        });
      });

      // 오래된 순으로 정렬 (화면 표시용)
      newMessages.reverse();

      setMessages(newMessages);
      setOldestDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  // 이전 메시지 로드 (페이지네이션)
  const loadMore = useCallback(async () => {
    if (!groupId || !hasMore || loadingMore || !oldestDoc) return;

    setLoadingMore(true);

    try {
      const messagesRef = getMessagesRef(groupId);
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(oldestDoc),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const olderMessages: Message[] = [];

      snapshot.forEach((doc) => {
        olderMessages.push({
          id: doc.id,
          ...(doc.data() as Omit<Message, 'id'>),
        });
      });

      // 오래된 순으로 정렬
      olderMessages.reverse();

      // 기존 메시지 앞에 추가
      setMessages((prev) => [...olderMessages, ...prev]);
      setOldestDoc(snapshot.docs[snapshot.docs.length - 1] || oldestDoc);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [groupId, hasMore, loadingMore, oldestDoc]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  };
};
