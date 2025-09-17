import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ConfigDetailViewer from 'components/ConfigDetailViewer';
import useConfig from 'api/config';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { factoryChip } from 'common/StatusChips';

// ==============================|| CONFIG STATUS CONSTANTS ||============================== //
const CONFIG_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const CONFIG_STATUS_CONFIG = {
  [CONFIG_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [CONFIG_STATUS.ACTIVE]: { color: 'success' as const, label: 'Hoạt động' }
};
const StatusChip = factoryChip(CONFIG_STATUS_CONFIG);

// ==============================|| CONFIG VIEW PAGE ||============================== //
function ConfigViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById } = useConfig();
  const { config, configLoading, configError } = getById(Number(id || 0));

  // ==============================|| STATE ||============================== //
  const [initialLoading, setInitialLoading] = useState(true);
  const [localData, setLocalData] = useState<any[]>([]);

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (config && !configLoading) {
      setInitialLoading(false);
      setLocalData(config.data || []);
    }
  }, [config, configLoading]);

  useEffect(() => {
    if (configError) {
      console.error('Fetch config error:', configError);
      openSnackbar({
        open: true,
        message: 'Không thể tải thông tin cấu hình',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      navigate('/system/config');
    }
  }, [configError, navigate]);

  // ==============================|| HANDLERS ||============================== //
  const handleEdit = useCallback(() => {
    navigate(`/system/config/edit/${id}`);
  }, [navigate, id]);

  const handleBack = useCallback(() => {
    navigate('/system/config');
  }, [navigate]);

  const handleDataChange = useCallback((newData: any[]) => {
    setLocalData(newData);
  }, []);

  // ==============================|| RENDER ||============================== //
  if (initialLoading || configLoading) {
    return (
      <MainCard title="Chi tiết cấu hình">
        <Box sx={{ p: 2, textAlign: 'center' }}>Đang tải...</Box>
      </MainCard>
    );
  }

  if (!config) {
    return (
      <MainCard title="Chi tiết cấu hình">
        <Box sx={{ p: 2, textAlign: 'center' }}>Không tìm thấy cấu hình</Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Chi tiết cấu hình">
      <Box sx={{ p: 3 }}>
        {/* Section 1: Thông tin cơ bản */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            📋 Thông tin cơ bản
          </Typography>

          <Box
            sx={{
              p: 3,
              bgcolor: 'primary.50',
              borderRadius: 2
            }}
          >
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth label="Mã cấu hình" value={config.code} InputProps={{ readOnly: true }} variant="outlined" />
                <TextField fullWidth label="Tên cấu hình" value={config.name} InputProps={{ readOnly: true }} variant="outlined" />
              </Stack>
              <TextField fullWidth label="Loại mã" value={config.codeType} InputProps={{ readOnly: true }} variant="outlined" />
              <TextField
                fullWidth
                label="Mô tả"
                value={config.description}
                InputProps={{ readOnly: true }}
                multiline
                rows={3}
                variant="outlined"
              />
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Trạng thái
                </Typography>
                <StatusChip status={config.status} />
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Section 2: Screen Names */}
        {config.metaData?.screenNames && config.metaData.screenNames.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              🖥️ Screen Names
            </Typography>

            <Box
              sx={{
                p: 3,
                bgcolor: 'primary.50',
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {config.metaData.screenNames.map((screen, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      mx: 0.5,
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      bgcolor: 'white'
                    }}
                  >
                    {screen}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Section 3: Config Detail Items */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'secondary.main', fontWeight: 600 }}>
            ⚙️ Config Detail Items
          </Typography>

          <Box
            sx={{
              bgcolor: 'info.50',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <ConfigDetailViewer data={localData} onDataChange={handleDataChange} configId={Number(id)} />
          </Box>
        </Box>

        {/* Section 4: Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary' }}></Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleBack} size="large" sx={{ minWidth: 120 }}>
              Quay lại
            </Button>
            <Button variant="contained" onClick={handleEdit} size="large" sx={{ minWidth: 120 }}>
              Chỉnh sửa
            </Button>
          </Stack>
        </Box>
      </Box>
    </MainCard>
  );
}

export default ConfigViewPage;
