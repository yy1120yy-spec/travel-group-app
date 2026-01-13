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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { useMenus, useMenuActions } from '@/lib/hooks/useMenu';
import { getUser } from '@/lib/firebase/auth';
import Loading from '@/components/common/Loading';

export default function MenuPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { menus, loading } = useMenus(groupId);
  const { addMenu, toggleMenuSelection, deleteMenu } = useMenuActions(groupId);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    restaurant: '',
    items: [{ name: '', price: 0 }],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();
  const userName = user?.name || '익명';

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.restaurant.trim()) {
      setError('식당 이름을 입력해주세요');
      return;
    }

    const validItems = formData.items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      setError('최소 1개의 메뉴를 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await addMenu({
        scheduleId: '',
        restaurant: formData.restaurant.trim(),
        items: validItems.map((item) => ({
          name: item.name.trim(),
          price: item.price,
        })),
      });

      setShowDialog(false);
      setFormData({ restaurant: '', items: [{ name: '', price: 0 }] });
    } catch (err) {
      setError(err instanceof Error ? err.message : '메뉴 추가 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSelection = async (menuId: string, itemName: string, currentMenu: any) => {
    try {
      await toggleMenuSelection(menuId, itemName, userName, currentMenu);
    } catch (err) {
      alert('선택 실패');
    }
  };

  const handleDelete = async (menuId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteMenu(menuId);
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  if (loading) {
    return <Loading message="메뉴를 불러오는 중..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          메뉴 사전 체크
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          메뉴 추가
        </Button>
      </Box>

      {menus.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              아직 등록된 메뉴가 없습니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setShowDialog(true)}
            >
              첫 메뉴 추가하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {menus.map((menu) => {
            const totalCount = menu.items.reduce((sum, item) => sum + item.selectedBy.length, 0);

            return (
              <Card key={menu.id}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {menu.restaurant}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        총 {totalCount}개 선택됨
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(menu.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox"></TableCell>
                          <TableCell>메뉴</TableCell>
                          <TableCell align="right">가격</TableCell>
                          <TableCell>선택한 사람</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {menu.items.map((item) => {
                          const isSelected = item.selectedBy.includes(userName);
                          return (
                            <TableRow key={item.name} hover>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() =>
                                    handleToggleSelection(menu.id, item.name, menu)
                                  }
                                />
                              </TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell align="right">
                                {item.price > 0 ? `${item.price.toLocaleString()}원` : '-'}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {item.selectedBy.map((name, index) => (
                                    <Chip
                                      key={index}
                                      label={name}
                                      size="small"
                                      color={name === userName ? 'primary' : 'default'}
                                    />
                                  ))}
                                  {item.selectedBy.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                      없음
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* 메뉴 추가 다이얼로그 */}
      <Dialog
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 메뉴 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="식당 이름"
              value={formData.restaurant}
              onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
              placeholder="예: 제주 흑돼지 전문점"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                메뉴 목록
              </Typography>
              {formData.items.map((item, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].name = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                    placeholder="메뉴 이름"
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={item.price || ''}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].price = Number(e.target.value);
                      setFormData({ ...formData, items: newItems });
                    }}
                    placeholder="가격"
                    sx={{ width: '120px' }}
                  />
                  {formData.items.length > 1 && (
                    <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button size="small" onClick={handleAddItem} startIcon={<AddIcon />}>
                메뉴 추가
              </Button>
            </Box>

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
