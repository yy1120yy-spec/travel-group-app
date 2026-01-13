'use client';

import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  onSendText: (content: string) => Promise<void>;
  onSendImage?: (file: File) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  loading?: boolean;
  uploadProgress?: number;
}

export default function MessageInput({
  onSendText,
  onSendImage,
  onTyping,
  onStopTyping,
  loading = false,
  uploadProgress = 0,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const contentToSend = message.trim();
    setMessage('');
    onStopTyping?.();

    try {
      await onSendText(contentToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(contentToSend);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      onTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendImage) return;

    try {
      await onSendImage(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 56,
        left: 0,
        right: 0,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 999,
      }}
    >
      {/* 업로드 진행률 */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ mb: 1 }}
        />
      )}

      <Box display="flex" gap={1} alignItems="flex-end">
        {/* 파일 input (숨김) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* 이미지 업로드 버튼 */}
        <IconButton
          onClick={handleImageClick}
          disabled={loading}
          color="default"
        >
          <ImageIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
          size="small"
        />

        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || loading}
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}
