'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container } from '@mui/material';
import Header from '@/components/common/Header';
import Navbar from '@/components/common/Navbar';
import Loading from '@/components/common/Loading';
import { useGroup } from '@/lib/hooks/useGroup';
import { getUser, addGroupId } from '@/lib/firebase/auth';

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { group, loading, joinGroup } = useGroup(groupId);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const checkAndJoinGroup = async () => {
      if (loading || !group) return;

      const user = getUser();
      if (!user || !user.name) {
        // 사용자 이름이 없으면 홈으로 리다이렉트
        router.push('/');
        return;
      }

      // 이미 그룹에 속해있는지 확인
      if (!group.members.includes(user.name)) {
        setJoining(true);
        try {
          await joinGroup(groupId, user.name);
        } catch (error) {
          console.error('그룹 참여 실패:', error);
          alert('그룹 참여에 실패했습니다.');
          router.push('/');
        } finally {
          setJoining(false);
        }
      } else {
        // 이미 멤버면 로컬 스토리지에 추가
        addGroupId(groupId);
      }
    };

    checkAndJoinGroup();
  }, [group, loading, groupId, joinGroup, router]);

  if (loading || joining || !group) {
    return <Loading fullScreen message="그룹 정보를 불러오는 중..." />;
  }

  return (
    <>
      <Header title={group.name} showNotifications />
      <Box sx={{ pb: 8 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
      <Navbar groupId={groupId} />
    </>
  );
}
