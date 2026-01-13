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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Restaurant as RestaurantIcon,
  DirectionsBus as TransportIcon,
  Hotel as HotelIcon,
  LocalActivity as ActivityIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import { useSchedules, useScheduleActions } from '@/lib/hooks/useSchedule';
import { ScheduleType } from '@/types/schedule';
import Loading from '@/components/common/Loading';

const scheduleTypeConfig = {
  meal: { label: '식사', icon: RestaurantIcon, color: 'success' as const },
  transport: { label: '이동', icon: TransportIcon, color: 'info' as const },
  accommodation: { label: '숙소', icon: HotelIcon, color: 'warning' as const },
  activity: { label: '활동', icon: ActivityIcon, color: 'secondary' as const },
};

export default function SchedulePage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { schedules, loading } = useSchedules(groupId);
  const { addSchedule, deleteSchedule } = useScheduleActions(groupId);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
    type: 'activity' as ScheduleType,
    notificationTime: 30,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await addSchedule({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        time: format(formData.time, 'HH:mm'),
      });

      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        time: new Date(),
        location: '',
        type: 'activity',
        notificationTime: 30,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 추가 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  if (loading) {
    return <Loading message="일정을 불러오는 중..." />;
  }

  // 날짜별로 그룹화
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const dateKey = format(schedule.date.toDate(), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          일정 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          일정 추가
        </Button>
      </Box>

      {schedules.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              아직 등록된 일정이 없습니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setShowDialog(true)}
            >
              첫 일정 추가하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {Object.entries(groupedSchedules).map(([dateKey, daySchedules]) => (
            <Box key={dateKey} mb={3}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                {format(new Date(dateKey), 'M월 d일 (EEEE)', { locale: ko })}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {daySchedules.map((schedule) => {
                  const TypeIcon = scheduleTypeConfig[schedule.type].icon;
                  return (
                    <Card key={schedule.id}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box display="flex" gap={2} flex={1}>
                            <Box sx={{ color: `${scheduleTypeConfig[schedule.type].color}.main` }}>
                              <TypeIcon />
                            </Box>
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Chip
                                  label={schedule.time}
                                  size="small"
                                  color="primary"
                                />
                                <Chip
                                  label={scheduleTypeConfig[schedule.type].label}
                                  size="small"
                                  color={scheduleTypeConfig[schedule.type].color}
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="h6" gutterBottom>
                                {schedule.title}
                              </Typography>
                              {schedule.description && (
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {schedule.description}
                                </Typography>
                              )}
                              {schedule.location && (
                                <Typography variant="caption" color="text.secondary">
                                  📍 {schedule.location}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* 일정 추가 다이얼로그 */}
      <Dialog
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 일정 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="제목"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 제주공항 도착"
            />
            <TextField
              fullWidth
              label="설명 (선택)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="날짜"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="시간"
                value={formData.time}
                onChange={(newValue) => setFormData({ ...formData, time: newValue || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="장소 (선택)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>일정 유형</InputLabel>
              <Select
                value={formData.type}
                label="일정 유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduleType })}
              >
                {Object.entries(scheduleTypeConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>알림</InputLabel>
              <Select
                value={formData.notificationTime}
                label="알림"
                onChange={(e) => setFormData({ ...formData, notificationTime: Number(e.target.value) })}
              >
                <MenuItem value={0}>알림 없음</MenuItem>
                <MenuItem value={15}>15분 전</MenuItem>
                <MenuItem value={30}>30분 전</MenuItem>
                <MenuItem value={60}>1시간 전</MenuItem>
                <MenuItem value={1440}>하루 전</MenuItem>
              </Select>
            </FormControl>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
