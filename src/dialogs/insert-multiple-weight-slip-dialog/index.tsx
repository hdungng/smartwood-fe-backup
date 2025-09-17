import { CustomDialog } from 'components/@extended/dialog';
import { DialogRequest, useGlobal } from 'contexts';
import { Stack } from '@mui/material';
import { dateHelper, DatePickerFormat, formatPatterns, numberHelper } from 'utils';
import { ListTruckRequest, ListTruckResponse, truckService } from 'services/truck';
import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { useBoolean } from '../../hooks';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { ActualTowingFormProps } from '../../pages/contract/purchase/manage/schema';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/system';
import Checkbox from '@mui/material/Checkbox';
import { SelectionOption } from 'types/common';
import { Input } from 'components/@extended/input';

type FilterQuery = {
  loadingDate?: DatePickerFormat;
  codeBookingOption?: SelectionOption;
};

type Props = DialogRequest & {
  actualTowing: Dynamic[];
  saleContractId: number;
  codeBookingOptions: SelectionOption[];
};

const TRUCK_WARNING_SIZE = 20;
const CURRENT_DATE = dateHelper.now();

const InsertMultipleWeightSlipDialog = ({ saleContractId, actualTowing, codeBookingOptions, ...otherProps }: Props) => {
  const { supplierMap, shippingUnitMap } = useGlobal();
  const [logisticTrucks, setLogisticTrucks] = useState<ListTruckResponse[]>([]);
  const [filters, setFilters] = useState<Nullable<FilterQuery>>({ codeBookingOption: null, loadingDate: CURRENT_DATE });
  const fetching = useBoolean();
  const submitting = useBoolean();
  const [selectedTrucks, setSelectedTrucks] = useState<ListTruckResponse[]>([]);

  const handleFetchTruck = async () => {
    try {
      setSelectedTrucks([]);
      fetching.onTrue();

      let query: ListTruckRequest = {
        saleContractId,
        size: 20,
        page: 1
      };

      if (filters?.loadingDate) {
        query = { ...query, loadingDate: dateHelper.formatDate(filters.loadingDate, formatPatterns.iso.date) };
      }
      if (filters?.codeBookingOption) {
        query = { ...query, codeBooking: filters.codeBookingOption.label };
      }

      const response = await truckService.listTrucks(query);

      setLogisticTrucks(response?.data?.data || []);
    } finally {
      fetching.onFalse();
    }
  };

  useEffect(() => {
    handleFetchTruck();
  }, []);

  const duplicateItemTruckWithFieldQuantity = (truck: ListTruckResponse) => {
    const quantity = truck.totalCont || 1;
    return quantity > 1 ? Array.from({ length: quantity }, () => truck) : [truck];
  };

  const allTrucks = useMemo(() => {
    let result: ListTruckResponse[] = [];
    selectedTrucks.forEach((truck) => {
      result.push(...duplicateItemTruckWithFieldQuantity(truck));
    });

    return result;
  }, [selectedTrucks]);

  const trucksConflict = useMemo(
    () =>
      allTrucks.filter((truck) =>
        actualTowing.some(
          (at: ActualTowingFormProps) =>
            at.codeBooking.value === truck.shippingScheduleId &&
            at.supplier?.value === truck.supplierId &&
            dateHelper.formatIsSame(at.loadingDate, truck.loadingDate, 'date') &&
            at.delivery.value === truck.transportUnit
        )
      ),
    [actualTowing, allTrucks]
  );

  const handleSave = () => {
    try {
      submitting.onTrue();

      otherProps.onClose({
        success: true,
        payload: {
          trucks: allTrucks || [],
          trucksConflict: trucksConflict || []
        }
      });
    } finally {
      submitting.onFalse();
    }
  };

  const hasOverQuantity = useMemo(() => allTrucks.length > TRUCK_WARNING_SIZE, [allTrucks]);

  return (
    <CustomDialog
      title="Thêm phiếu cân"
      maxWidth="lg"
      fullWidth
      {...otherProps}
      action={
        <>
          <Button variant="outlined" color="inherit" onClick={() => otherProps.onClose()}>
            Đóng
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={selectedTrucks.length === 0 || hasOverQuantity || submitting.value}>
            Thêm phiếu cân
          </Button>
        </>
      }
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="flex-end" spacing={1}>
          <Input.DatePicker
            label="Ngày đóng hàng"
            minDate={dateHelper.addDay(CURRENT_DATE, -7)}
            value={filters?.loadingDate}
            onChange={(newDate: DatePickerFormat) =>
              setFilters((state) => ({
                ...state,
                loadingDate: newDate
              }))
            }
            slotProps={{
              field: {
                clearable: true
              },
            }}
          />

          <Input.Autocomplete
            label="Code Booking"
            options={codeBookingOptions}
            value={filters?.codeBookingOption}
            onChange={(newValue: SelectionOption) =>
              setFilters((state) => ({
                ...state,
                codeBookingOption: newValue
              }))
            }
            sx={{
              width: 250
            }}
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />

          <Button
            variant="contained"
            onClick={handleFetchTruck}
            disabled={fetching.value || (!filters?.loadingDate && !filters?.codeBookingOption)}
            style={{
              marginBottom: 3
            }}
          >
            Tìm kiếm
          </Button>
        </Stack>

        <Typography variant="h6" fontWeight="bold">
          Thông tin vận chuyển:
        </Typography>

        {fetching.value ? (
          <Stack direction="row" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack
            bgcolor="#f8f9fa"
            sx={{
              ...(logisticTrucks.length === 0 && { justifyContent: 'center', alignItems: 'center', height: 200 })
            }}
          >
            {logisticTrucks.length > 0 ? (
              <Stack>
                <Stack direction="row" alignItems="start" p={2} spacing={1}>
                  <Box width="5%" />
                  <Box width="20%">
                    <Typography fontWeight="bold">Số booking</Typography>
                  </Box>

                  <Box width="30%">
                    <Typography fontWeight="bold">Tên xưởng</Typography>
                  </Box>

                  <Box width="15%">
                    <Typography fontWeight="bold">Ngày đóng hàng</Typography>
                  </Box>

                  <Box width="30%">
                    <Typography fontWeight="bold">Đơn vị vận chuyển</Typography>
                  </Box>

                  <Box width="10%">
                    <Typography fontWeight="bold">Số Cont</Typography>
                  </Box>
                </Stack>
                <Stack spacing={0} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                  {logisticTrucks.map((logisticTruck) => (
                    <Stack
                      key={`${logisticTruck.codeBooking}-${logisticTruck.supplierId}-${logisticTruck.id}`}
                      direction="row"
                      alignItems="center"
                      py={0.5}
                      px={1}
                      spacing={1}
                    >
                      <Box width="5%">
                        <Checkbox
                          value={selectedTrucks.includes(logisticTruck)}
                          onChange={() => {
                            setSelectedTrucks((state) => {
                              if (state.includes(logisticTruck)) {
                                return state.filter((item) => item !== logisticTruck);
                              }
                              return [...state, logisticTruck];
                            });
                          }}
                        />
                      </Box>

                      <Box width="20%">{logisticTruck?.shippingSchedule?.codeBooking}</Box>

                      <Box width="30%">{supplierMap.get(logisticTruck.supplierId)?.label || ''}</Box>

                      <Box width="15%">{dateHelper.formatDate(logisticTruck.loadingDate as DatePickerFormat)}</Box>

                      <Box width="30%">{shippingUnitMap.get(logisticTruck.transportUnit)?.label || ''}</Box>

                      <Box width="10%">{numberHelper.formatNumber(logisticTruck.totalCont)}</Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Không có thông tin vận tải khả dụng
              </Typography>
            )}
          </Stack>
        )}

        {trucksConflict.length > 0 && (
          <Alert severity="error" color="error">
            Có <strong>{trucksConflict.length}</strong> vận chuyển bị xung đột với phiếu cân hiện tại. Hệ thống sẽ xóa và thêm lại các vận
            chuyển này.
          </Alert>
        )}

        {hasOverQuantity && (
          <Alert severity="error" color="error">
            Số luợng vận chuyển thêm vào vượt ngưỡng <strong>{allTrucks.length}</strong> / <strong>{TRUCK_WARNING_SIZE}</strong>. Vui lòng
            điều chỉnh và thử lại.
          </Alert>
        )}
      </Stack>
    </CustomDialog>
  );
};

export default InsertMultipleWeightSlipDialog;
