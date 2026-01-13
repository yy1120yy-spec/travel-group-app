'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  TravelExplore as TravelIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { useGroup, useUserGroups } from '@/lib/hooks/useGroup';
import { getUser, updateUserName } from '@/lib/firebase/auth';
import Header from '@/components/common/Header';
import Loading from '@/components/common/Loading';

export default function Home() {
  const router = useRouter();
  const { createGroup } = useGroup();
  const { groups, loading: groupsLoading } = useUserGroups();

  const [userName, setUserName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState('');

  // 그룹 생성 폼
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user && user.name) {
      setUserName(user.name);
    } else {
      setShowNameDialog(true);
    }
  }, []);

  const handleSaveName = () => {
    if (!userName.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    updateUserName(userName.trim());
    setShowNameDialog(false);
    setError('');
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('그룹 이름을 입력해주세요');
      return;
    }
    if (!startDate || !endDate) {
      setError('날짜를 선택해주세요');
      return;
    }
    if (endDate < startDate) {
      setError('종료일은 시작일보다 늦어야 합니다');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const groupId = await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        startDate,
        endDate,
        createdBy: userName,
      });

      setShowCreateDialog(false);
      router.push(`/${groupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '그룹 생성 실패');
    } finally {
      setCreating(false);
    }
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/${groupId}`);
  };

  if (groupsLoading) {
    return <Loading fullScreen message="그룹 목록을 불러오는 중..." />;
  }

  return (
    <>
      <Header title="여행메이트" />
      <Container maxWidth="md" sx={{ py: 4, mb: 8 }}>
        <Box textAlign="center" mb={6}>
          <TravelIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            여행메이트
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            함께 만드는 여행 일정
          </Typography>
        </Box>

        <Box mb={4}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ py: 2, mb: 2 }}
          >
            새 여행 그룹 만들기
          </Button>
        </Box>

        {groups.length > 0 && (
          <>
            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                내 여행 그룹
              </Typography>
            </Divider>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              {groups.map((group) => (
                <Box key={group.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {group.name}
                      </Typography>
                      {group.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {group.description}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {group.startDate.toDate().toLocaleDateString('ko-KR')} -{' '}
                          {group.endDate.toDate().toLocaleDateString('ko-KR')}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        멤버 {group.members.length}명
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </>
        )}

        {/* 이름 입력 다이얼로그 */}
        <Dialog open={showNameDialog} maxWidth="xs" fullWidth>
          <DialogTitle>이름을 입력해주세요</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="이름"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              sx={{ mt: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSaveName} variant="contained">
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 그룹 생성 다이얼로그 */}
        <Dialog
          open={showCreateDialog}
          onClose={() => !creating && setShowCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>새 여행 그룹 만들기</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="그룹 이름"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="예: 제주도 여행"
              />
              <TextField
                fullWidth
                label="설명 (선택)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="간단한 설명을 입력하세요"
                multiline
                rows={2}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="시작일"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="종료일"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={startDate || undefined}
                />
              </LocalizationProvider>
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)} disabled={creating}>
              취소
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={creating}
            >
              {creating ? '생성 중...' : '만들기'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
