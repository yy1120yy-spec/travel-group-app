'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Message } from '@/types/message';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserName: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function MessageList({
  messages,
  currentUserName,
  onDeleteMessage,
  onEditMessage,
  loadMore,
  hasMore = false,
  loadingMore = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    if (messages.length > 0 && !loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loadingMore]);

  // 이전 메시지 로드 후 스크롤 위치 유지
  useEffect(() => {
    if (loadingMore) {
      setPrevScrollHeight(containerRef.current?.scrollHeight || 0);
    } else if (prevScrollHeight > 0 && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [loadingMore, prevScrollHeight]);

  // 스크롤 이벤트: 위로 스크롤 시 이전 메시지 로드
  const handleScroll = () => {
    if (!containerRef.current || !loadMore || !hasMore || loadingMore) return;

    const { scrollTop } = containerRef.current;

    // 최상단 근처 (50px 이내)에서 로드
    if (scrollTop < 50) {
      loadMore();
    }
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: 'calc(100vh - 240px)',
        overflowY: 'auto',
        p: 2,
        pb: 10,
      }}
    >
      {/* 이전 메시지 로딩 인디케이터 */}
      {loadingMore && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 더 이상 메시지 없음 */}
      {!hasMore && messages.length > 0 && (
        <Box display="flex" justifyContent="center" py={2}>
          <Typography variant="caption" color="text.secondary">
            대화의 시작입니다
          </Typography>
        </Box>
      )}

      {messages.map((message) => {
        const isOwn = message.author === currentUserName;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            onDelete={isOwn ? onDeleteMessage : undefined}
            onEdit={isOwn ? onEditMessage : undefined}
          />
        );
      })}

      <div ref={bottomRef} />
    </Box>
  );
}
