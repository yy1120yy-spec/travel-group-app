'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp, setDoc } from 'firebase/firestore';
import { Group, GroupFormData } from '@/types/group';
import {
  getGroupRef,
  getGroup,
  subscribeToDocument,
  getMessagesRef,
  addDocument,
} from '@/lib/firebase/firestore';
import { addGroupId, getUser } from '@/lib/firebase/auth';

export const useGroup = (groupId?: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    const unsubscribe = subscribeToDocument(
      getGroupRef(groupId),
      (data) => {
        setGroup(data as Group);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  const createGroup = async (formData: GroupFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const newGroupId = uuidv4();
      const groupRef = getGroupRef(newGroupId);

      const groupData: Omit<Group, 'id'> = {
        name: formData.name,
        description: formData.description,
        startDate: Timestamp.fromDate(formData.startDate),
        endDate: Timestamp.fromDate(formData.endDate),
        createdAt: Timestamp.now(),
        members: [formData.createdBy],
        createdBy: formData.createdBy,
      };

      await setDoc(groupRef, groupData);
      addGroupId(newGroupId);

      setLoading(false);
      return newGroupId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '그룹 생성 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const joinGroup = async (groupId: string, memberName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const existingGroup = await getGroup(groupId) as Group | null;
      if (!existingGroup) {
        throw new Error('그룹을 찾을 수 없습니다');
      }

      // 이미 멤버인지 확인
      if (existingGroup.members.includes(memberName)) {
        addGroupId(groupId);
        setLoading(false);
        return true;
      }

      // 멤버 추가
      const groupRef = getGroupRef(groupId);
      await setDoc(
        groupRef,
        {
          members: [...existingGroup.members, memberName],
        },
        { merge: true }
      );

      // 시스템 메시지 생성
      const messagesRef = getMessagesRef(groupId);
      await addDocument(messagesRef, {
        groupId,
        content: `${memberName}님이 입장하셨습니다`,
        type: 'system',
        author: 'system',
        isEdited: false,
        readBy: [],
      });

      addGroupId(groupId);
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '그룹 참여 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    group,
    loading,
    error,
    createGroup,
    joinGroup,
  };
};

// 사용자가 속한 그룹 목록 가져오기
export const useUserGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserGroups = async () => {
      const user = getUser();
      if (!user || user.groupIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const groupPromises = user.groupIds.map((id) => getGroup(id));
        const loadedGroups = await Promise.all(groupPromises);
        setGroups(loadedGroups.filter((g): g is Group => g !== null));
      } catch (error) {
        console.error('그룹 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserGroups();
  }, []);

  return { groups, loading };
};
