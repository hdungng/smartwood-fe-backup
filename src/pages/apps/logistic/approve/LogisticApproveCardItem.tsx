import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PCTruckSchedule } from 'types/contracts/logistic/truck';
import { TRANSPORT_TYPE } from 'utils';
import { styled } from '@mui/material/styles';
import { Avatar, Box, Button, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import {
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { formatCurrency, formatDate, formatWeight } from 'utils/helper';
import { TMapViewConfigData } from 'types/contracts/logistic/logistic';
import { handleStatusVerhicle } from 'utils/logistic-helper';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out'
  }
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'pending' && {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7'
  }),
  ...(status === 'approved' && {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  }),
  ...(status === 'rejected' && {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  }),
  ...(status === 'in_transit' && {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb'
  })
}));

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  in_transit: 'Đang vận chuyển'
};

const LogisticApproveTruckCardItem = (props: {
  transportType: TRANSPORT_TYPE;
  detailData: PCTruckSchedule | PCShipSchedule;
  mapDataViewConfig: TMapViewConfigData;
  onViewDetail: (data: PCTruckSchedule | PCShipSchedule) => void;
  onApprove: (data: PCTruckSchedule | PCShipSchedule) => void;
  onReject: (data: PCTruckSchedule | PCShipSchedule) => void;
}) => {
  const { transportType, detailData, mapDataViewConfig, onViewDetail, onApprove, onReject } = props;

  let renderType = <></>;
  switch (transportType) {
    case TRANSPORT_TYPE.TRUCK:
      const truck = detailData as PCTruckSchedule;
      renderType = (
        <>
          <Grid sx={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: '#1976d2'
                }}
              >
                <CarOutlined />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {truck?.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  "Vận chuyển đường bộ"
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <StatusChip
                  label={statusLabels[handleStatusVerhicle(truck?.status) ?? 'pending']}
                  status={String(handleStatusVerhicle(truck?.status))}
                  size="small"
                />
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EnvironmentOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Từ:</strong> {mapDataViewConfig.pickupLocationMap.get(truck.pickupLocation) ?? truck.pickupLocation}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EnvironmentOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Đến:</strong> {mapDataViewConfig.deliveryLocationMap.get(truck.deliveryLocation) ?? truck?.deliveryLocation}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Yêu cầu:</strong> {formatDate(new Date(truck.createdAt))}
                  </Typography>
                </Box>
              </Grid>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Loại hàng:</strong> {mapDataViewConfig.goodsMap.get(truck.goodsType) ?? truck.goodsType}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khối lượng:</strong> {formatWeight(truck.quantity, '')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Chi phí ước tính:</strong> {formatCurrency(truck.transportFee)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid sx={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Đơn vị vận chuyển:</strong> {mapDataViewConfig.shippingsMap.get(truck.transportCompany) ?? truck.transportCompany}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" startIcon={<EyeOutlined />} onClick={() => onViewDetail(truck)}>
                  Xem
                </Button>
                {String(handleStatusVerhicle(truck?.status)) === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      onClick={() => onApprove(truck)}
                    >
                      Duyệt
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      startIcon={<CloseCircleOutlined />}
                      onClick={() => onReject(truck)}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </>
      );
      break;
    case TRANSPORT_TYPE.SHIP:
      const ship = detailData as PCShipSchedule;
      renderType = (
        <>
          <Grid sx={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: '#2e7d32'
                }}
              >
                <ShopOutlined />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">
                  {ship?.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  "Vận chuyển đường biển"
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <StatusChip
                  label={statusLabels[handleStatusVerhicle(ship?.status) ?? 'pending']}
                  status={String(handleStatusVerhicle(ship?.status))}
                  size="small"
                />
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EnvironmentOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Từ:</strong> {mapDataViewConfig.pickupLocationMap.get(ship.departurePort) ?? ship.departurePort}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EnvironmentOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Đến:</strong> {mapDataViewConfig.deliveryLocationMap.get(ship.arrivalPort) ?? ship.arrivalPort}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarOutlined
                    style={{
                      marginRight: 8,
                      color: '#999',
                      fontSize: 20
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Yêu cầu:</strong> {formatDate(new Date(ship.createdAt))}
                  </Typography>
                </Box>
              </Grid>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Loại hàng:</strong> {mapDataViewConfig.goodsMap.get(ship.goodsType) ?? ship.goodsType}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Khối lượng:</strong> {formatWeight(ship.containerQuantity, '')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Chi phí ước tính:</strong> {/* {formatCurrency(ship.estimatedCost)} */}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid sx={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Tên tàu:</strong> {ship.portName}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" startIcon={<EyeOutlined />} onClick={() => onViewDetail(ship)}>
                  Xem
                </Button>
                {String(handleStatusVerhicle(ship?.status)) === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      onClick={() => onApprove(ship)}
                    >
                      Duyệt
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      startIcon={<CloseCircleOutlined />}
                      onClick={() => onReject(ship)}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </>
      );
      break;
  }

  return (
    <>
      <StyledCard key={detailData.code}>
        <CardContent>
          <Grid container spacing={2}>
            {renderType}
          </Grid>
        </CardContent>
      </StyledCard>
    </>
  );
};

export default LogisticApproveTruckCardItem;
