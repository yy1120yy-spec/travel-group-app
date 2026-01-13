'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Announcement as AnnouncementIcon,
  HowToVote as VoteIcon,
  Restaurant as RestaurantIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  groupId: string;
}

export default function Navbar({ groupId }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로를 기반으로 활성 탭 결정
  const getCurrentValue = () => {
    if (pathname.includes('/schedule')) return 'schedule';
    if (pathname.includes('/announcements')) return 'announcements';
    if (pathname.includes('/votes')) return 'votes';
    if (pathname.includes('/menu')) return 'menu';
    if (pathname.includes('/chat')) return 'chat';
    return 'dashboard';
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    switch (newValue) {
      case 'dashboard':
        router.push(`/${groupId}`);
        break;
      case 'schedule':
        router.push(`/${groupId}/schedule`);
        break;
      case 'announcements':
        router.push(`/${groupId}/announcements`);
        break;
      case 'votes':
        router.push(`/${groupId}/votes`);
        break;
      case 'menu':
        router.push(`/${groupId}/menu`);
        break;
      case 'chat':
        router.push(`/${groupId}/chat`);
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction
          label="홈"
          value="dashboard"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="일정"
          value="schedule"
          icon={<CalendarIcon />}
        />
        <BottomNavigationAction
          label="공지"
          value="announcements"
          icon={<AnnouncementIcon />}
        />
        <BottomNavigationAction
          label="투표"
          value="votes"
          icon={<VoteIcon />}
        />
        <BottomNavigationAction
          label="메뉴"
          value="menu"
          icon={<RestaurantIcon />}
        />
        <BottomNavigationAction
          label="채팅"
          value="chat"
          icon={<ChatIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
