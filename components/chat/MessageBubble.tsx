'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  TextField,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Message } from '@/types/message';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  onDelete,
  onEdit,
}: MessageBubbleProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (onDelete && confirm('이 메시지를 삭제하시겠습니까?')) {
      onDelete(message.id);
    }
    handleMenuClose();
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditContent(message.content);
    handleMenuClose();
  };

  const handleEditSave = () => {
    if (onEdit && editContent.trim() !== '') {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  // 시스템 메시지 렌더링
  if (message.type === 'system') {
    return (
      <Box display="flex" justifyContent="center" my={2}>
        <Chip
          label={message.content}
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      mb={1}
      gap={1}
    >
      {!isOwn && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {message.author[0]}
        </Avatar>
      )}

      <Box maxWidth="70%">
        {!isOwn && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {message.author}
          </Typography>
        )}

        <Paper
          elevation={1}
          sx={{
            p: message.type === 'image' ? 0.5 : 1.5,
            bgcolor: isOwn ? 'primary.main' : 'background.paper',
            color: isOwn ? 'white' : 'text.primary',
            position: 'relative',
          }}
        >
          {/* 이미지 메시지 */}
          {message.type === 'image' && message.imageUrl && (
            <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
              <Image
                src={message.imageUrl}
                alt={message.imageMetadata?.name || '이미지'}
                width={300}
                height={300}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '300px',
                  display: 'block',
                }}
              />
            </Box>
          )}

          {/* 텍스트 메시지 - 수정 모드 */}
          {message.type === 'text' && isEditing ? (
            <Box>
              <TextField
                fullWidth
                multiline
                size="small"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                sx={{
                  '& .MuiInputBase-input': {
                    color: isOwn ? 'white' : 'text.primary',
                  },
                }}
              />
              <Box display="flex" justifyContent="flex-end" gap={0.5} mt={0.5}>
                <IconButton size="small" onClick={handleEditSave} sx={{ color: 'inherit' }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleEditCancel} sx={{ color: 'inherit' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            message.type === 'text' && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            )
          )}

          {/* 시간 및 수정 표시 */}
          {!isEditing && (
            <Box display="flex" alignItems="center" gap={0.5} mt={message.type === 'image' ? 0.5 : 0.5}>
              {/* 읽음 표시 (본인 메시지만) */}
              {isOwn && (
                <Box sx={{ opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                  {message.readBy.length > 1 ? (
                    <DoneAllIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <DoneIcon sx={{ fontSize: 14 }} />
                  )}
                </Box>
              )}
              <Typography variant="caption" sx={{ opacity: 0.7, px: message.type === 'image' ? 1 : 0 }}>
                {format(message.createdAt.toDate(), 'p', { locale: ko })}
              </Typography>
              {message.isEdited && (
                <Typography variant="caption" sx={{ opacity: 0.5, fontStyle: 'italic' }}>
                  (수정됨)
                </Typography>
              )}
            </Box>
          )}

          {/* 메뉴 버튼 */}
          {isOwn && !isEditing && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                color: 'inherit',
                bgcolor: message.type === 'image' ? 'rgba(0,0,0,0.3)' : 'transparent',
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {message.type === 'text' && (
          <MenuItem onClick={handleEditStart}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            수정
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
}
