'use client';

import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

interface TypingIndicatorProps {
  typingUsers: string[];
}

const blink = keyframes`
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
`;

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const displayText =
    typingUsers.length === 1
      ? `${typingUsers[0]}님이 입력 중...`
      : typingUsers.length === 2
      ? `${typingUsers[0]}님, ${typingUsers[1]}님이 입력 중...`
      : `${typingUsers[0]}님 외 ${typingUsers.length - 1}명이 입력 중...`;

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="caption" color="text.secondary">
          {displayText}
        </Typography>
        <Box display="flex" gap={0.3}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'text.secondary',
                animation: `${blink} 1.4s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
