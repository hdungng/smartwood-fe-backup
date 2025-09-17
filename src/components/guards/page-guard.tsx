import { useRole } from 'contexts';
import React, { useMemo } from 'react';
import MainCard from '../MainCard';
import { Typography, Button, Stack, Avatar, Fade } from '@mui/material';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ScreenPermission } from 'services/authority';
import { StopOutlined } from '@ant-design/icons';

type Props = {
  permission?: ScreenPermission;
  permissions?: ScreenPermission[];
  children: React.ReactNode;
};

const PageGuard = ({ permission, permissions, children }: Props) => {
  const { hasPermission } = useRole();
  const navigate = useNavigate();

  const requestPermissions = useMemo(() => {
    const result = [...(permissions || [])];

    if (permission) {
      result.push(permission);
    }
    return result;
  }, [permission, permissions]);

  const hasAllow = useMemo(() => hasPermission(requestPermissions), [requestPermissions, hasPermission]);

  if (hasAllow) {
    return <>{children}</>;
  }

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Fade in timeout={500}>
      <MainCard
        sx={{
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack spacing={4} alignItems="center" sx={{ maxWidth: 500, mx: 'auto' }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: '1.75rem',
              bgcolor: 'error.light',
              color: 'error.main'
            }}
          >
            <StopOutlined style={{ fontSize: 40 }} />
          </Avatar>

          <Stack spacing={2} alignItems="center">
            <Typography
              variant="h4"
              color="error.main"
              sx={{
                fontWeight: 'bold',
                '@keyframes slideInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(30px)'
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                animation: 'slideInUp 0.5s ease-out'
              }}
            >
              Truy cập bị từ chối
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền truy cập hoặc quay lại trang trước
              đó.
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              sx={{
                minWidth: 140,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Quay lại
            </Button>

            <Button
              variant="outlined"
              startIcon={<HomeOutlined />}
              onClick={handleGoHome}
              sx={{
                minWidth: 140,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Trang chủ
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </Fade>
  );
};

export default PageGuard;
