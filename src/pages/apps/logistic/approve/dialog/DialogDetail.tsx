import { Button } from '@mui/material';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import { useGlobal } from 'contexts/GlobalContext';
import { useIntl } from 'react-intl';
import { TMapViewConfigData } from 'types/contracts/logistic/logistic';
import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PCTruckSchedule } from 'types/contracts/logistic/truck';
import { TRANSPORT_TYPE } from 'utils';
import { formatCurrency, formatDate } from 'utils/helper';

const DialogLogisticDetail = (props: {
  detailData: PCShipSchedule | PCTruckSchedule | null;
  transportType: TRANSPORT_TYPE;
  viewDialogOpen: boolean;
  mapDataViewConfig: TMapViewConfigData;
  closeDialog: () => void;
}) => {
  const { closeDialog, viewDialogOpen, transportType, detailData, mapDataViewConfig } = props;
  const intl = useIntl();
  const global = useGlobal();
  const { shippingUnits } = global;

  let renderTypeDetail = <></>;
  switch (transportType) {
    case TRANSPORT_TYPE.SHIP:
      const ship = detailData as PCShipSchedule;

      renderTypeDetail = (
        <>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Mã yêu cầu" secondary={ship.bookingNumber} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loại vận chuyển" secondary={'Đường biển'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loại hàng hóa" secondary={mapDataViewConfig.goodsMap.get(ship.goodsType) ?? ship.goodsType} />
              </ListItem>
            </List>
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin vận chuyển
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Điểm đi" secondary={mapDataViewConfig.pickupLocationMap.get(ship.departurePort)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Điểm đến" secondary={mapDataViewConfig.deliveryLocationMap.get(ship.arrivalPort)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Ngày yêu cầu" secondary={formatDate(new Date(ship.createdAt))} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Ngày cần giao" secondary={formatDate(new Date(ship.cutoffDate))} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Đơn vị vận chuyển" secondary={mapDataViewConfig.shippingsMap.get(ship.shippingLine)} />
              </ListItem>
            </List>
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Chi tiết phương tiện
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Container:</strong> {ship.vesselCapacity} (Số lượng: {ship.containerQuantity})
            </Alert>
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Chi phí và ghi chú
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Chi phí ước tính:</strong>{' '}
              {formatCurrency(shippingUnits.find((item) => item.code === ship.shippingLine)?.basePrice ?? 0)}
            </Typography>
            <Typography variant="body1">
              <strong>Ghi chú:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              {ship.notes}
            </Typography>
          </Grid>
        </>
      );
      break;
    case TRANSPORT_TYPE.TRUCK:
      const truck = detailData as PCTruckSchedule;
      renderTypeDetail = (
        <>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Mã yêu cầu" secondary={truck.code} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loại vận chuyển" secondary={'Đường bộ'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loại hàng hóa" secondary={mapDataViewConfig.goodsMap.get(truck?.goodsType) ?? truck?.goodsType} />
              </ListItem>
            </List>
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin vận chuyển
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Điểm đi" secondary={mapDataViewConfig.pickupLocationMap.get(truck.pickupLocation) ?? ''} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Điểm đến" secondary={mapDataViewConfig.deliveryLocationMap.get(truck.deliveryLocation) ?? ''} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Ngày yêu cầu" secondary={formatDate(new Date(truck.createdAt))} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Ngày cần giao" secondary={formatDate(new Date(truck.deliveryDate))} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Đơn vị vận chuyển"
                  secondary={mapDataViewConfig.shippingsMap.get(truck?.transportCompany) ?? truck?.transportCompany}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Chi tiết phương tiện
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Xe tải:</strong> {mapDataViewConfig.vehicleMap.get(truck.vehicleType) ?? truck.vehicleType} (Số lượng:{' '}
              {truck.quantity})
            </Alert>
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Chi phí và ghi chú
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Chi phí ước tính:</strong> {formatCurrency(truck.transportFee)}
            </Typography>
            <Typography variant="body1">
              <strong>Ghi chú:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              {truck.notes}
            </Typography>
          </Grid>
        </>
      );

      break;
  }

  return (
    <>
      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => closeDialog()} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết yêu cầu vận chuyển</DialogTitle>
        <DialogContent>
          {detailData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {renderTypeDetail}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog()}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogLogisticDetail;
