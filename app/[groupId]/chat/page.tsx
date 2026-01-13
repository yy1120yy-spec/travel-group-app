'use client';

import { useParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useMessages } from '@/lib/hooks/useMessages';
import { useMessageActions } from '@/lib/hooks/useMessageActions';
import { useReadReceipts } from '@/lib/hooks/useReadReceipts';
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator';
import { useGroup } from '@/lib/hooks/useGroup';
import { getUser } from '@/lib/firebase/auth';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import Loading from '@/components/common/Loading';

export default function ChatPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const user = getUser();
  const userName = user?.name || '익명';

  const { group } = useGroup(groupId);
  const { messages, loading, loadingMore, hasMore, loadMore } = useMessages(groupId);
  const {
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    loading: actionLoading,
    uploadProgress,
  } = useMessageActions(groupId);

  const handleSendText = async (content: string) => {
    await sendMessage({
      content,
      type: 'text',
      author: userName,
    });
  };

  const handleSendImage = async (file: File) => {
    await sendImageMessage(file, userName);
  };

  // 다른 사람이 보낸 메시지 중 아직 읽지 않은 메시지
  const unreadMessageIds = messages
    .filter((msg) => msg.author !== userName && !msg.readBy.includes(userName))
    .map((msg) => msg.id);

  // 자동 읽음 처리
  useReadReceipts(groupId, userName, unreadMessageIds);

  // 타이핑 인디케이터
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(groupId, userName);

  if (loading) {
    return <Loading message="채팅을 불러오는 중..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2}>
        <Typography variant="h5" fontWeight={700}>
          채팅
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {group?.members.length || 0}명
        </Typography>
      </Box>

      <MessageList
        messages={messages}
        currentUserName={userName}
        onDeleteMessage={deleteMessage}
        onEditMessage={editMessage}
        loadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        loading={actionLoading}
        uploadProgress={uploadProgress}
      />
    </Box>
  );
}
