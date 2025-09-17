// material-ui
import { Divider, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import 'react-quill-new/dist/quill.snow.css';
import Autocomplete from '@mui/material/Autocomplete';
import { SaveOutlined } from '@ant-design/icons';

// third-party
import { forwardRef, useEffect, useState } from 'react';
import PCPackingPlanGoodSupplierTable from './PCPackingPlanGoodSupplierTable';

import ApprovalSection from './ApprovalSection';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionCreatePurchaseContractPackingPlan,
  actionFetchContracts,
  actionFetchPurchaseContractByID,
  actionUpdatePurchaseContractPackingPlan,
  logisticSelector,
  resetState,
  setContract,
  setPurchaseContractPackingPlan,
  TLogisticState
} from 'redux/Logistic';
import { isEmpty, isNil, pick } from 'lodash';
import { PurchaseContractPackingPlan } from 'types/contracts/purchase/logistic';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { IShippingPurchaseContract } from 'types/logistcs';
import { PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';
import axiosServices from 'utils/axios';
// project imports

// ==============================|| BASIC WIZARD - logistics ||============================== //

const LogisticForm = forwardRef(({}, ref) => {
  const dispatch = useDispatch();
  const logisticState: TLogisticState = useSelector(logisticSelector);
  const intl = useIntl();

  // Calculate totals when products change
  useEffect(() => {
    dispatch(actionFetchContracts());
    getListShippingList();
  }, []);

  const caculate = () => {
    if (logisticState.pcPackingPlans.length > 0) {
      const totalQuantity = logisticState.pcPackingPlans.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = logisticState.pcPackingPlans.reduce((sum, item) => sum + item.realQuanity, 0);

      const averagePricePerTon = Math.floor(totalValue / totalQuantity);

      dispatch(
        setPurchaseContractPackingPlan({
          ...logisticState.purchaseContractPackingPlan,
          totalValue: totalValue,
          totalQuantity: totalQuantity,
          averagePricePerTon
        })
      );
    }
  };

  const handleSavePurchasePackingPlan = () => {
    // EDIT
    if (logisticState.purchaseContractPackingPlan && logisticState.purchaseContractPackingPlan.id >= 0) {
      const pcPackingPlan = { ...logisticState.purchaseContractPackingPlan };
      const dataUpdate: Partial<PurchaseContractPackingPlan> = pick(pcPackingPlan, [
        'code',
        'status',
        'lastUpdatedProgram',
        'totalQuantity',
        'totalValue',
        'averagePricePerTon',
        'currency',
        'isApprove',
        'purchaseContractId'
      ]);

      if (!isEmpty(dataUpdate) && logisticState.purchaseContractPackingPlan.id >= 0 && logisticState.purchaseContract.id >= 0) {
        dispatch(
          actionUpdatePurchaseContractPackingPlan({
            id: logisticState.purchaseContractPackingPlan.id,
            data: {
              ...dataUpdate,
              purchaseContractId: logisticState.purchaseContract.id
            }
          })
        );
      }
    }
    // ADD NEW
    else {
      if (logisticState.purchaseContract && logisticState.purchaseContract.id >= 0) {
        dispatch(
          actionCreatePurchaseContractPackingPlan({
            ...logisticState.purchaseContractPackingPlan,
            purchaseContractId: logisticState.purchaseContract.id,
            pcPackingPlanGoodSuppliers: logisticState.pcPackingPlans
          })
        );
      }
    }

    if (logisticState.success === true && isEmpty(logisticState.error)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }

    if (logisticState.success === false && !isEmpty(logisticState.error)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const handleChange = (field: keyof PurchaseContractPackingPlan, value: any) => {
    dispatch(
      setPurchaseContractPackingPlan({
        ...logisticState.purchaseContractPackingPlan,
        [`${field}`]: value
      })
    );
  };

  const [listShippingSchedule, setListShippingSchedule] = useState<IShippingPurchaseContract[]>([]);
  const getListShippingList = async () => {
    try {
      const { data, status } = await axiosServices.get(PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON /* + `/page` + `?page=1&size=1000` */);
      if (status === 200 || status === 201) {
        setListShippingSchedule(data.data);
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'get_list_code_booking_fail' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4 }}>
        Kế hoạch đóng hàng
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Số/code booking</InputLabel>
            <Autocomplete
              // options={(logisticState?.contracts ?? []).map((item) => item?.code)}
              options={listShippingSchedule.map((item) => item.code)}
              value={logisticState.contract?.code}
              onChange={(_, value) => {
                dispatch(resetState());
                // const selectedContract = logisticState.contracts?.find((item) => item?.code === value);
                const selectedContract = listShippingSchedule?.find((item) => item?.code === value);

                if (selectedContract) {
                  dispatch(setContract(selectedContract as any));
                  handleChange('code', selectedContract.code);

                  if (!isNil(selectedContract.saleContractId) && selectedContract.saleContractId >= 0) {
                    dispatch(actionFetchPurchaseContractByID(selectedContract.saleContractId));
                  }
                }
              }}
              renderInput={(params) => <TextField {...params} name="code" placeholder="Lựa chọn hợp đồng" />}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin hàng hóa và xưởng sản xuất
            </Typography>
            <PCPackingPlanGoodSupplierTable caculateTotal={caculate} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider />
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 2 }}>
            Tổng hợp
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Tổng lượng hàng</InputLabel>
            <TextField
              id="totalQuantity"
              name="totalQuantity"
              placeholder="Tổng số lượng"
              fullWidth
              value={logisticState.purchaseContractPackingPlan?.totalQuantity ?? 0}
              disabled
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Tổng giá</InputLabel>
            <TextField
              id="totalValue"
              name="totalValue"
              placeholder="Tổng giá trị"
              fullWidth
              value={logisticState.purchaseContractPackingPlan?.totalValue ?? 0}
              disabled
            />
          </Stack>
          {
            //  Number(formik.values.totalPrice) > 1000 && (
            //     <FormHelperText error>
            //         Tổng giá trị phải lớn hơn giá trị hợp đồng
            //     </FormHelperText>
            //   )
          }
        </Grid>

        <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Đơn giá trung bình/tấn hàng hóa</InputLabel>
            <TextField
              id="averagePricePerTon"
              name="averagePricePerTon"
              placeholder="Giá trung bình"
              fullWidth
              value={logisticState.purchaseContractPackingPlan?.averagePricePerTon ?? 0}
              disabled
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<SaveOutlined />} onClick={() => handleSavePurchasePackingPlan()} sx={{ mt: 2 }}>
            Lưu
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4 }}>
        Phê duyệt
      </Typography>
      <ApprovalSection />
    </>
  );
});
export default LogisticForm;
