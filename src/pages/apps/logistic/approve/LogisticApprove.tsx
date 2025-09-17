// material-ui
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { Box, Button, Card, CardContent, Grid, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import { CODE_DESTINATION, CODE_EXPORT_PORT, CODE_QUALITY_TYPE, CODE_REGION, CODE_VEHICLE_TYPE } from 'constants/code';
import { useGlobal } from 'contexts/GlobalContext';
import { isEmpty } from 'lodash-es';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { actionFetchPCShipSchedules, actionUpdatePCShipSchedule, logisticShipSelector, TLogisticShipState } from 'redux/LogisticShip';
import { actionFetchPCTruckSchedules, actionUpdatePCTruckSchedule, logisticTruckSelector, TLogisticTruckState } from 'redux/LogisticTruck';
import { purchaseContractSelector, TPurchaseContractState } from 'redux/PurchaseContract';
import { TMapViewConfigData } from 'types/contracts/logistic/logistic';
import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PCTruckSchedule } from 'types/contracts/logistic/truck';
import { CommonStatus, STATUS_TRANSPORT, TRANSPORT_TYPE } from 'utils';
import { handleStatusVerhicle, handleStatusVerhicleNumber } from 'utils/logistic-helper';
import LogisticApproveTruckCardItem from './LogisticApproveCardItem';
import DialogApprove from './dialog/DialogApprove';
import DialogLogisticDetail from './dialog/DialogDetail';
import DialogReject from './dialog/DialogReject';

const LogisticApprove = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const global = useGlobal();

  const truckState: TLogisticTruckState = useSelector(logisticTruckSelector);
  const shipState: TLogisticShipState = useSelector(logisticShipSelector);
  const { configs: configList } = useGlobal();
  const { purchaseContracts }: TPurchaseContractState = useSelector(purchaseContractSelector);

  const [selectedData, setSelectedData] = useState<PCTruckSchedule | PCShipSchedule | null>();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(handleStatusVerhicle(CommonStatus.Pending));
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  });

  const [mapDataViewConfig, setMapDataViewConfig] = useState<TMapViewConfigData>({
    deliveryLocationMap: new Map(),
    pickupLocationMap: new Map(),
    qualityTypesMap: new Map(),
    regionMap: new Map(),
    vehicleMap: new Map(),
    goodsMap: new Map(),
    shippingsMap: new Map(),
    purchaseContractsMap: new Map()
  });

  const { goods, shippingUnits } = global;

  useEffect(() => {
    const deliveryLocations = configList?.find((item) => item.code === CODE_EXPORT_PORT)?.data ?? [];
    const deliveryLocationMap = new Map();
    deliveryLocations.forEach((item) => {
      deliveryLocationMap.set(item?.value, item?.key);
    });

    const pickupLocations = configList?.find((item) => item.code === CODE_DESTINATION)?.data ?? [];
    const pickupLocationMap = new Map();
    pickupLocations.forEach((item) => {
      pickupLocationMap.set(item?.key, item?.value);
    });

    const qualityTypes = configList?.find((item) => item.code === CODE_QUALITY_TYPE)?.data ?? [];
    const qualityTypesMap = new Map();
    qualityTypes.forEach((item) => {
      qualityTypesMap.set(item?.value, item?.key);
    });

    const regions = configList?.find((item) => item.code === CODE_REGION)?.data ?? [];
    const regionMap = new Map();
    regions.forEach((item) => {
      regionMap.set(item?.value, item?.key);
    });

    const vehicles = configList?.find((item) => item.code === CODE_VEHICLE_TYPE)?.data ?? [];
    const vehicleMap = new Map();
    vehicles.forEach((item) => {
      vehicleMap.set(item?.value, item?.key);
    });

    const goodsMap = new Map();
    goods.forEach((item) => {
      goodsMap.set(item?.code, item?.brand);
    });

    const shippingsMap = new Map();
    shippingUnits.forEach((item) => {
      shippingsMap.set(item?.code, item?.fullName);
    });

    const purchaseContractsMap = new Map();
    purchaseContracts.forEach((item) => {
      purchaseContractsMap.set(item?.id, item?.code);
    });

    setMapDataViewConfig({
      deliveryLocationMap,
      pickupLocationMap,
      qualityTypesMap,
      regionMap,
      vehicleMap,
      goodsMap,
      shippingsMap,
      purchaseContractsMap
    });
  }, []);

  useEffect(() => {
    const Status = handleStatusVerhicleNumber(statusFilter ?? 'pending');
    if (typeFilter === TRANSPORT_TYPE.TRUCK) {
      dispatch(
        actionFetchPCTruckSchedules({
          Status,
          page: pagination.pageIndex,
          size: pagination.pageSize
        })
      );
    } else if (typeFilter === TRANSPORT_TYPE.SHIP) {
      dispatch(
        actionFetchPCShipSchedules({
          Status,
          page: pagination.pageIndex,
          size: pagination.pageSize
        })
      );
    } else {
      dispatch(
        actionFetchPCTruckSchedules({
          Status,
          page: pagination.pageIndex,
          size: pagination.pageSize
        })
      );

      dispatch(
        actionFetchPCShipSchedules({
          Status,
          page: pagination.pageIndex,
          size: pagination.pageSize
        })
      );
    }
  }, [typeFilter, pagination, statusFilter]);

  const getList = () => {
    if (typeFilter === TRANSPORT_TYPE.TRUCK) {
      return truckState.PCTruckSchedules;
    } else if (typeFilter === TRANSPORT_TYPE.SHIP) {
      return shipState.PCShipSchedules;
    } else {
      return [...shipState.PCShipSchedules, ...truckState.PCTruckSchedules];
    }
  };

  const handleViewDetail = (data: PCTruckSchedule | PCShipSchedule) => {
    setSelectedData(data);
    setViewDialogOpen(true);
  };

  const handleApprove = (data: PCTruckSchedule | PCShipSchedule) => {
    setSelectedData(data);
    setApproveDialogOpen(true);
  };

  const handleReject = (data: PCTruckSchedule | PCShipSchedule) => {
    setSelectedData(data);
    setRejectDialogOpen(true);
  };

  const confirmApprove = (params: { note: string }) => {
    if (selectedData) {
      if (selectedData.transportType === TRANSPORT_TYPE.SHIP) {
        dispatch(
          actionUpdatePCShipSchedule({
            id: selectedData.id,
            data: {
              notes: params?.note ?? selectedData?.notes,
              status: STATUS_TRANSPORT.APPROVED
            }
          })
        );

        if (truckState.success === true && isEmpty(truckState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }

        if (truckState.success === false && !isEmpty(truckState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
            autoHideDuration: 2500,
            variant: 'error',
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      } else {
        dispatch(
          actionUpdatePCTruckSchedule({
            id: selectedData.id,
            data: {
              notes: params?.note ?? selectedData?.notes,
              status: STATUS_TRANSPORT.APPROVED
            }
          })
        );

        if (shipState.success === true && isEmpty(shipState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }

        if (shipState.success === false && !isEmpty(shipState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
            autoHideDuration: 2500,
            variant: 'error',
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      }

      setApproveDialogOpen(false);
      setSelectedData(null);
    }
  };

  const confirmReject = (params: { note: string }) => {
    if (selectedData) {
      if (selectedData.transportType === TRANSPORT_TYPE.SHIP) {
        dispatch(
          actionUpdatePCShipSchedule({
            id: selectedData.id,
            data: {
              notes: params?.note ?? selectedData?.notes,
              status: STATUS_TRANSPORT.REJECT
            }
          })
        );

        if (truckState.success === true && isEmpty(truckState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }

        if (truckState.success === false && !isEmpty(truckState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
            autoHideDuration: 2500,
            variant: 'error',
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      } else {
        dispatch(
          actionUpdatePCTruckSchedule({
            id: selectedData.id,
            data: {
              notes: params?.note ?? selectedData?.notes,
              status: STATUS_TRANSPORT.REJECT
            }
          })
        );

        if (shipState.success === true && isEmpty(shipState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }

        if (shipState.success === false && !isEmpty(shipState.error)) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
            autoHideDuration: 2500,
            variant: 'error',
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      }

      setRejectDialogOpen(false);
      setSelectedData(null);
    }
  };

  return (
    <MainCard title="Duyệt Yêu Cầu Vận Chuyển" content={false}>
      <Box sx={{ p: 3 }}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid sx={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchOutlined style={{ marginRight: 8, color: '#999' }} />
                  }}
                />
              </Grid>
              <Grid sx={{ xs: 12, md: 3 }}>
                <TextField select fullWidth label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="pending">Chờ duyệt</MenuItem>
                  <MenuItem value="approved">Đã duyệt</MenuItem>
                  <MenuItem value="rejected">Từ chối</MenuItem>
                  <MenuItem value="in_transit">Đang vận chuyển</MenuItem>
                </TextField>
              </Grid>
              <Grid sx={{ xs: 12, md: 3 }}>
                <TextField select fullWidth label="Loại vận chuyển" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="all">Tất cả loại</MenuItem>
                  <MenuItem value="truck">Đường bộ</MenuItem>
                  <MenuItem value="ship">Đường biển</MenuItem>
                </TextField>
              </Grid>
              <Grid sx={{ xs: 12, md: 3 }}>
                <Button variant="outlined" startIcon={<ExportOutlined />} fullWidth sx={{ height: '56px' }}>
                  Xuất báo cáo
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid sx={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Typography variant="h6">Chờ duyệt</Typography>
                <Typography variant="h4">{getList().filter((r) => handleStatusVerhicle(r.status) === 'pending').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid sx={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Typography variant="h6">Đã duyệt</Typography>
                <Typography variant="h4">{getList().filter((r) => handleStatusVerhicle(r.status) === 'approved').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid sx={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Typography variant="h6">Từ chối</Typography>
                <Typography variant="h4">{getList().filter((r) => handleStatusVerhicle(r.status) === 'rejected').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid sx={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Typography variant="h6">Đang vận chuyển</Typography>
                <Typography variant="h4">{getList().filter((r) => handleStatusVerhicle(r.status) === 'in_transit').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Requests List */}
        <Box>
          {getList().map((data) => (
            <LogisticApproveTruckCardItem
              transportType={(data?.transportType as TRANSPORT_TYPE) ?? ''}
              detailData={data}
              mapDataViewConfig={mapDataViewConfig}
              onViewDetail={handleViewDetail}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </Box>

        <Pagination
          count={
            typeFilter === TRANSPORT_TYPE.SHIP
              ? (shipState?.meta?.totalPages ?? 1)
              : typeFilter === TRANSPORT_TYPE.TRUCK
                ? (truckState?.meta?.totalPages ?? 1)
                : Math.max(shipState?.meta?.totalPages ?? 1, truckState?.meta?.totalPages ?? 1)
          }
          page={pagination.pageIndex}
          onChange={(_, value) => {
            setPagination((prev) => ({
              ...prev,
              pageIndex: value
            }));
          }}
        />

        {getList().length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy yêu cầu vận chuyển nào
            </Typography>
          </Box>
        )}
      </Box>

      {/* View Details Dialog */}
      <DialogLogisticDetail
        detailData={selectedData ?? null}
        closeDialog={() => {
          setViewDialogOpen(false);
        }}
        transportType={(selectedData?.transportType as TRANSPORT_TYPE) ?? ''}
        viewDialogOpen={viewDialogOpen}
        mapDataViewConfig={mapDataViewConfig}
      />

      {/* Approve Dialog */}
      <DialogApprove
        approveDialogOpen={approveDialogOpen}
        detailData={selectedData ?? null}
        closeApproveDialog={() => {
          setApproveDialogOpen(false);
        }}
        confirmApprove={confirmApprove}
      />

      {/* Reject Dialog */}
      <DialogReject
        rejectDialogOpen={rejectDialogOpen}
        detailData={selectedData ?? null}
        closeRejectDialog={() => {
          setRejectDialogOpen(false);
        }}
        confirmReject={confirmReject}
      />
    </MainCard>
  );
};

export default LogisticApprove;
