'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Announcement as AnnouncementIcon,
  HowToVote as VoteIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useGroup } from '@/lib/hooks/useGroup';

export default function GroupDashboard() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { group } = useGroup(groupId);

  if (!group) return null;

  const menuItems = [
    {
      title: '일정 관리',
      description: '여행 일정을 추가하고 관리하세요',
      icon: <CalendarIcon sx={{ fontSize: 48 }} />,
      href: `/${groupId}/schedule`,
      color: 'primary.main',
    },
    {
      title: '공지사항',
      description: '그룹 공지를 공유하세요',
      icon: <AnnouncementIcon sx={{ fontSize: 48 }} />,
      href: `/${groupId}/announcements`,
      color: 'error.main',
    },
    {
      title: '투표',
      description: '일정이나 장소를 투표로 결정하세요',
      icon: <VoteIcon sx={{ fontSize: 48 }} />,
      href: `/${groupId}/votes`,
      color: 'secondary.main',
    },
    {
      title: '메뉴 체크',
      description: '레스토랑 메뉴를 사전에 선택하세요',
      icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
      href: `/${groupId}/menu`,
      color: 'success.main',
    },
  ];

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/${groupId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${group.name} - 여행메이트`,
          text: '여행 그룹에 초대합니다!',
          url: shareUrl,
        });
      } catch (err) {
        console.log('공유 취소:', err);
      }
    } else {
      // 클립보드에 복사
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다!');
      } catch (err) {
        console.error('복사 실패:', err);
        alert(`링크: ${shareUrl}`);
      }
    }
  };

  const tripDuration = Math.ceil(
    (group.endDate.toDate().getTime() - group.startDate.toDate().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Box>
      {/* 그룹 정보 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h5" fontWeight={700}>
            {group.name}
          </Typography>
          <ShareIcon
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={handleShareLink}
          />
        </Box>

        {group.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {group.description}
          </Typography>
        )}

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip
            icon={<CalendarIcon />}
            label={`${tripDuration + 1}일`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<PeopleIcon />}
            label={`${group.members.length}명`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {group.startDate.toDate().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            -{' '}
            {group.endDate.toDate().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>
      </Paper>

      {/* 메뉴 그리드 */}
      <Grid container spacing={2}>
        {menuItems.map((item) => (
          <Grid item xs={6} sm={6} md={3} key={item.title}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                component={Link}
                href={item.href}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 3,
                }}
              >
                <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
                <CardContent sx={{ p: 0, textAlign: 'center', width: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 멤버 목록 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          멤버
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {group.members.map((member, index) => (
            <Chip
              key={index}
              label={member}
              color={member === group.createdBy ? 'primary' : 'default'}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
