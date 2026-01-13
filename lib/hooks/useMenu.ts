'use client';

import { useState, useEffect } from 'react';
import { doc, orderBy, deleteDoc, setDoc } from 'firebase/firestore';
import { Menu, MenuFormData, MenuItem } from '@/types/menu';
import {
  getMenusRef,
  addDocument,
  subscribeToCollection,
} from '@/lib/firebase/firestore';

export const useMenus = (groupId: string) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const menusRef = getMenusRef(groupId);
    const unsubscribe = subscribeToCollection(
      menusRef,
      (data) => {
        setMenus(data as Menu[]);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, [groupId]);

  return { menus, loading };
};

export const useMenuActions = (groupId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMenu = async (formData: MenuFormData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const menusRef = getMenusRef(groupId);
      const menuData = {
        scheduleId: formData.scheduleId,
        restaurant: formData.restaurant,
        items: formData.items.map((item) => ({
          ...item,
          selectedBy: [],
        })),
      };

      const menuId = await addDocument(menusRef, menuData);
      setLoading(false);
      return menuId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메뉴 추가 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const toggleMenuSelection = async (
    menuId: string,
    itemName: string,
    userName: string,
    currentMenu: Menu
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const menuRef = doc(getMenusRef(groupId), menuId);
      const newItems = currentMenu.items.map((item) => {
        if (item.name === itemName) {
          const isSelected = item.selectedBy.includes(userName);
          return {
            ...item,
            selectedBy: isSelected
              ? item.selectedBy.filter((name) => name !== userName)
              : [...item.selectedBy, userName],
          };
        }
        return item;
      });

      await setDoc(menuRef, { items: newItems }, { merge: true });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '선택 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteMenu = async (menuId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const menuRef = doc(getMenusRef(groupId), menuId);
      await deleteDoc(menuRef);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메뉴 삭제 실패';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    loading,
    error,
    addMenu,
    toggleMenuSelection,
    deleteMenu,
  };
};
