// 링크 기반 인증 시스템
// 별도의 Firebase Authentication이 필요 없는 간단한 시스템

const STORAGE_KEY = 'travel_group_user';

export interface User {
  name: string;
  groupIds: string[];
}

// LocalStorage에서 사용자 정보 가져오기
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// LocalStorage에 사용자 정보 저장
export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

// 사용자 이름 업데이트
export const updateUserName = (name: string): void => {
  const user = getUser();
  if (user) {
    setUser({ ...user, name });
  } else {
    setUser({ name, groupIds: [] });
  }
};

// 그룹 ID 추가
export const addGroupId = (groupId: string): void => {
  const user = getUser();
  if (user) {
    if (!user.groupIds.includes(groupId)) {
      setUser({ ...user, groupIds: [...user.groupIds, groupId] });
    }
  }
};

// 그룹 ID 제거
export const removeGroupId = (groupId: string): void => {
  const user = getUser();
  if (user) {
    setUser({
      ...user,
      groupIds: user.groupIds.filter((id) => id !== groupId),
    });
  }
};

// 사용자가 그룹에 속해있는지 확인
export const isUserInGroup = (groupId: string): boolean => {
  const user = getUser();
  return user ? user.groupIds.includes(groupId) : false;
};
