import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import { Box, Typography, Breadcrumbs, Link, Button, Stack } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ConfigDetailList from 'components/ConfigDetailList';
import useConfig from 'api/config';

// ==============================|| CONFIG DETAIL PAGE ||============================== //
function ConfigDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById } = useConfig();
  const { config, configLoading } = getById(Number(id || 0));

  // ==============================|| RENDER ||============================== //
  return (
    <MainCard title="Quản lý Config Detail Items">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/system/config" color="inherit">
              Danh sách Config
            </Link>
            <Typography color="text.primary">{config?.name || 'Config Detail'}</Typography>
          </Breadcrumbs>
        </Box>

        {/* Config Info */}
        {config && (
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                📋 Thông tin Config
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate('/system/config')} size="large" sx={{ minWidth: 120 }}>
                  Quay lại
                </Button>
                <Button variant="contained" onClick={() => navigate(`/system/config/edit/${id}`)} size="large" sx={{ minWidth: 120 }}>
                  Chỉnh sửa
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Mã cấu hình
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {config.code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Tên cấu hình
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {config.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Loại mã
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {config.codeType}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Mô tả
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {config.description || 'Không có mô tả'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Config Detail List */}
        {id && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'secondary.main', fontWeight: 600 }}>
              ⚙️ Config Detail Items
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <ConfigDetailList codeId={Number(id)} />
            </Box>
          </Box>
        )}
      </Box>
    </MainCard>
  );
}

export default ConfigDetailPage;
