'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAnnouncements, useAnnouncementActions } from '@/lib/hooks/useAnnouncements';
import { getUser } from '@/lib/firebase/auth';
import Loading from '@/components/common/Loading';
import ReactMarkdown from 'react-markdown';

export default function AnnouncementsPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { announcements, loading } = useAnnouncements(groupId);
  const { addAnnouncement, togglePin, deleteAnnouncement } = useAnnouncementActions(groupId);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();
  const userName = user?.name || '익명';

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await addAnnouncement({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: userName,
        isPinned: formData.isPinned,
      });

      setShowDialog(false);
      setFormData({ title: '', content: '', isPinned: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : '공지 추가 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (announcementId: string, currentPinned: boolean) => {
    try {
      await togglePin(announcementId, !currentPinned);
    } catch (err) {
      alert('고정 변경 실패');
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteAnnouncement(announcementId);
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  if (loading) {
    return <Loading message="공지사항을 불러오는 중..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          공지사항
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          공지 작성
        </Button>
      </Box>

      {announcements.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              아직 작성된 공지사항이 없습니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setShowDialog(true)}
            >
              첫 공지 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {announcements.map((announcement) => (
            <Card key={announcement.id} sx={{ position: 'relative' }}>
              {announcement.isPinned && (
                <Chip
                  label="고정됨"
                  color="error"
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        {announcement.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(announcement.createdAt.toDate(), 'PPP p', { locale: ko })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleTogglePin(announcement.id, announcement.isPinned)}
                    >
                      {announcement.isPinned ? <PinIcon /> : <PinOutlinedIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box
                  sx={{
                    '& p': { mb: 1 },
                    '& ul, & ol': { ml: 2 },
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <ReactMarkdown>{announcement.content}</ReactMarkdown>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 공지 작성 다이얼로그 */}
      <Dialog
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>새 공지 작성</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="제목"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="내용"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={8}
              placeholder="마크다운 형식을 지원합니다"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                />
              }
              label="상단에 고정"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? '작성 중...' : '작성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
