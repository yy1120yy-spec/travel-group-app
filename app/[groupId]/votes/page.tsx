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
  LinearProgress,
  Chip,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useVotes, useVoteActions, calculateVoteResults } from '@/lib/hooks/useVotes';
import { getUser } from '@/lib/firebase/auth';
import Loading from '@/components/common/Loading';

export default function VotesPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { votes, loading } = useVotes(groupId);
  const { createVote, castVote, deleteVote } = useVoteActions(groupId);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    allowMultiple: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();
  const userName = user?.name || '익명';

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.question.trim()) {
      setError('질문을 입력해주세요');
      return;
    }

    const validOptions = formData.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError('최소 2개의 선택지를 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createVote({
        question: formData.question.trim(),
        options: validOptions.map((opt) => opt.trim()),
        createdBy: userName,
        expiresAt: null,
        allowMultiple: formData.allowMultiple,
      });

      setShowDialog(false);
      setFormData({ question: '', options: ['', ''], allowMultiple: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : '투표 생성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCastVote = async (voteId: string, option: string, currentVote: any) => {
    try {
      await castVote(voteId, option, userName, currentVote);
    } catch (err) {
      alert('투표 실패');
    }
  };

  const handleDelete = async (voteId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteVote(voteId);
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  if (loading) {
    return <Loading message="투표 목록을 불러오는 중..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          투표
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          투표 만들기
        </Button>
      </Box>

      {votes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              아직 진행 중인 투표가 없습니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setShowDialog(true)}
            >
              첫 투표 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {votes.map((vote) => {
            const results = calculateVoteResults(vote);
            const hasVoted = Object.values(vote.votes)
              .flat()
              .includes(userName);

            return (
              <Card key={vote.id}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {vote.question}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          {vote.createdBy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(vote.createdAt.toDate(), 'PPP', { locale: ko })}
                        </Typography>
                        {vote.allowMultiple && (
                          <Chip label="복수 선택" size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(vote.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <List disablePadding>
                    {results.map((result) => {
                      const isVoted = result.voters.includes(userName);
                      return (
                        <ListItem key={result.option} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton
                            onClick={() => handleCastVote(vote.id, result.option, vote)}
                            sx={{ borderRadius: 1, border: 1, borderColor: 'divider' }}
                          >
                            <ListItemIcon>
                              {isVoted ? (
                                <CheckCircleIcon color="primary" />
                              ) : (
                                <RadioIcon />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={result.option}
                              secondary={
                                <Box component="span">
                                  <LinearProgress
                                    variant="determinate"
                                    value={result.percentage}
                                    sx={{ my: 1, display: 'block' }}
                                  />
                                  <Typography variant="caption" component="span">
                                    {result.count}명 ({result.percentage.toFixed(0)}%)
                                  </Typography>
                                </Box>
                              }
                              secondaryTypographyProps={{ component: 'div' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* 투표 생성 다이얼로그 */}
      <Dialog
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 투표 만들기</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="질문"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="예: 점심 메뉴는 무엇으로 할까요?"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                선택지
              </Typography>
              {formData.options.map((option, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`선택지 ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <IconButton size="small" onClick={() => handleRemoveOption(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button size="small" onClick={handleAddOption} startIcon={<AddIcon />}>
                선택지 추가
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allowMultiple}
                  onChange={(e) =>
                    setFormData({ ...formData, allowMultiple: e.target.checked })
                  }
                />
              }
              label="복수 선택 허용"
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? '생성 중...' : '만들기'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
