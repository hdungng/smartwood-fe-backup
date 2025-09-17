import { Autocomplete, Button, Divider, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { Grid } from '@mui/material';

import { forwardRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionFetchContracts,
  actionFetchPurchaseContractByID,
  logisticSelector,
  setContract,
  TLogisticState
} from 'redux/Logistic';
import { useIntl } from 'react-intl';
import { isEmpty, isNil } from 'lodash-es';
import {
  actionCreatePCWeightTicket,
  actionCreatePCWeightTicketDetail,
  actionFetchPCWeightTicketByID,
  actionFetchPCWeightTicketDetailByPCWeightTicketID,
  actionUpdatePCWeightTicket,
  resetWeightTicket,
  setFieldPCWeightTicket,
  setFieldPCWeightTicketItem,
  setPCWeightTicket,
  setPCWeightTicketItems,
  TWeightSlipState,
  weightTicketSelector
} from 'redux/WeightSlip';
import { SaveOutlined } from '@ant-design/icons';
import { PCWeightTicket, PCWeightTicketItem } from 'types/contracts/purchase/weight-slip';
import { useGlobal } from 'contexts/GlobalContext';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

const WeightSlipForm = forwardRef(({}: {}, ref) => {
  const dispatch = useDispatch();
  const logisticState: TLogisticState = useSelector(logisticSelector);
  const weightTicketState: TWeightSlipState = useSelector(weightTicketSelector);
  const global = useGlobal();
  const { goods, shippingUnits } = global;
  const {id} = useParams();
  const intl = useIntl();
  const [isAddNew, setIsAddNew] = useState<boolean>(false);

  useEffect(() => {
    if (isEmpty(logisticState.contracts)) {
      dispatch(actionFetchContracts());
    }

    if (
      !isNil(logisticState?.purchaseContract?.purchaseContractWeighTicketId) &&
      logisticState.purchaseContract.purchaseContractWeighTicketId >= 0
    ) {
      dispatch(actionFetchPCWeightTicketByID(logisticState.purchaseContract.purchaseContractWeighTicketId));
      setIsAddNew(true);
    } else {
      setIsAddNew(false);
    }
  }, []);

  const caculatePCWeightTicketDetail = () => {
    if (weightTicketState.weightTicketItems.length > 0) {
      const update = { ...weightTicketState.weightTicket };
      const totalWeight = weightTicketState.weightTicketItems.reduce((sum, item) => {
        return sum + item.actualWeight;
      }, 0);
      const totalPrice = weightTicketState.weightTicketItems.reduce((sum, item) => {
        return sum + item.transportPrice;
      }, 0);
      update[`goodsWeight`] = totalWeight;
      update[`averageUnitPrice`] = totalPrice / totalWeight;

      dispatch(setPCWeightTicket(update));
    }
  };

  const handleSavePCWeightTicket = () => {
    if (isAddNew) {
      dispatch(
        actionCreatePCWeightTicket({
          ...weightTicketState.weightTicket,
          weightTicketItems: weightTicketState.weightTicketItems
        })
      );

      setIsAddNew(false);
    } else {
      if (weightTicketState.weightTicket?.id && weightTicketState.weightTicket.id > -1) {
        dispatch(
          actionUpdatePCWeightTicket({
            id: weightTicketState.weightTicket.id,
            data: weightTicketState.weightTicket
          })
        );
      }
    }
  };

  const handleChangePCWeightTicket = (field: keyof PCWeightTicket, value: any) => {
    // const update = { ...weightTicketState.weightTicket, [field]: value };

    // dispatch(setPCWeightTicket(update));

    dispatch(
      setFieldPCWeightTicket({
        field,
        value
      })
    );
  };

  const handleChangePCWeightTicketDetail = (field: keyof PCWeightTicketItem, value: any) => {
    // const update = { ...weightTicketState.weightTicketItem, [field]: value };

    // if (field === "shippingUnit") {
    //   update["transportPrice"] =
    //     shippingUnits.find((item) => item.code === value)?.basePrice ?? 0;
    // }

    // if (field === "goodType") {
    //   update["goodPrice"] =
    //     goods.find((item) => item.code === value)?.sellingPrice ?? 0;
    // }

    // dispatch(setPCWeightTicketItem(update));
    if (field === 'shippingUnit') {
      dispatch(
        setFieldPCWeightTicketItem({
          field: 'transportPrice',
          value: shippingUnits.find((item) => item.code === value)?.basePrice ?? 0
        })
      );
    }

    if (field === 'goodType') {
      dispatch(
        setFieldPCWeightTicketItem({
          field: 'goodPrice',
          value: goods.find((item) => item.code === value)?.sellingPrice ?? 0
        })
      );
    }

    dispatch(
      setFieldPCWeightTicketItem({
        field,
        value
      })
    );
  };

  const handleAddPCWeightTicketDetail = () => {
    if (logisticState?.purchaseContract?.code) {
      //EDIT
      if (weightTicketState.weightTicket.id && weightTicketState.weightTicket.id > -1) {
        dispatch(
          actionCreatePCWeightTicketDetail({
            ...weightTicketState.weightTicketItem,
            code: logisticState.purchaseContract.code,
            weightTicketId: weightTicketState.weightTicket.id
          })
        );

        if (!isNil(weightTicketState.weightTicket.id) && weightTicketState.weightTicket.id > -1) {
          dispatch(
            actionFetchPCWeightTicketDetailByPCWeightTicketID({
              PCWeightTicketID: weightTicketState.weightTicket.id
            })
          );

          caculatePCWeightTicketDetail();
        }
      }
      // ADD
      else {
        const update: any = [...weightTicketState.weightTicketItems];
        update.push({
          ...weightTicketState.weightTicketItem,
          code: logisticState.purchaseContract.code
        });
        caculatePCWeightTicketDetail();

        dispatch(setPCWeightTicketItems(update));
      }

      if (weightTicketState.success === true && isEmpty(weightTicketState.error)) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      }

      if (weightTicketState.success === false && !isEmpty(weightTicketState.error)) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
          autoHideDuration: 2500,
          variant: 'error',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      }
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4 }}>
        Thực tế kéo hàng
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Số/code booking</InputLabel>
            <Autocomplete
              id="weightingCode"
              options={(logisticState?.contracts ?? []).map((item) => item?.code)}
              value={logisticState.contract?.code}
              onChange={(_, value) => {
                // dispatch(resetState());
                dispatch(resetWeightTicket());
                const selectedContract = logisticState.contracts?.find((item) => item?.code === value);

                if (!selectedContract) return;

                dispatch(setContract(selectedContract));

                if (!isNil(selectedContract.purchaseContractId) && selectedContract.purchaseContractId >= 0) {
                  dispatch(actionFetchPurchaseContractByID(selectedContract.purchaseContractId));
                }

                if (
                  !isNil(logisticState.purchaseContract.purchaseContractWeighTicketId) &&
                  logisticState.purchaseContract.purchaseContractWeighTicketId >= 0
                ) {
                  dispatch(actionFetchPCWeightTicketByID(logisticState.purchaseContract.purchaseContractWeighTicketId));
                  setIsAddNew(false);
                } else {
                  setIsAddNew(true);
                }
              }}
              renderInput={(params) => <TextField {...params} name="code" placeholder="Lựa chọn hợp đồng" />}
            />
          </Stack>
        </Grid>

        {/* goodType */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Loại hàng mục tiêu</InputLabel>
            {/*goodType*/}
            <Autocomplete
              options={goods}
              getOptionLabel={(option) => `${option.brand}`}
              value={goods.find((good) => good.code === weightTicketState?.weightTicketItem?.goodType) || null}
              onChange={(e, newValue) => {
                handleChangePCWeightTicketDetail('goodType', newValue?.code ?? '');
              }}
              renderInput={(params) => <TextField {...params} placeholder="Chọn hàng hóa" />}
              componentsProps={{
                popupIndicator: {
                  title: intl.formatMessage({
                    id: 'open_dropdown_text'
                  })
                }
              }}
            />
          </Stack>
        </Grid>

        {/* loadingDate */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Ngày Đóng Hàng</InputLabel>
            <TextField
              type="date"
              value={
                weightTicketState?.weightTicketItem?.loadingDate
                  ? moment(weightTicketState?.weightTicketItem?.loadingDate).format('yyyy-MM-DD')
                  : moment().format('yyyy-MM-DD')
              }
              onChange={(e) => {
                const date = moment(e.target.value).toISOString();
                handleChangePCWeightTicketDetail('loadingDate', date);
              }}
              placeholder="Ngày đóng hàng"
              fullWidth
            />
          </Stack>
        </Grid>

        {/* factoryName */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Tên Xưởng/nhà máy</InputLabel>
            <TextField
              type="text"
              value={weightTicketState?.weightTicketItem?.factoryName}
              placeholder="Tên Xưởng/nhà máy"
              fullWidth
              onChange={(e) => handleChangePCWeightTicketDetail('factoryName', e.target.value)}
            />
          </Stack>
        </Grid>
        {/* actualWeight */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Khối Lượng Hàng</InputLabel>
            <TextField
              type="number"
              value={weightTicketState?.weightTicketItem?.actualWeight}
              placeholder="Khối Lượng Hàng"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              onChange={(e) => handleChangePCWeightTicketDetail('actualWeight', Number(e.target.value))}
            />
          </Stack>
        </Grid>
        {/* goodPrice */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Đơn Giá Hàng</InputLabel>
            <TextField
              type="number"
              value={weightTicketState?.weightTicketItem?.goodPrice}
              placeholder="ĐƠN GIÁ"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              disabled
            />
          </Stack>
        </Grid>
        {/* shippingUnit */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Tên Đơn Vị Vận Chuyển</InputLabel>
            {/*shippingUnit*/}
            <Autocomplete
              options={shippingUnits}
              getOptionLabel={(option) => `${option.name}`}
              value={shippingUnits.find((item) => item.code === weightTicketState?.weightTicketItem?.shippingUnit)}
              onChange={(_, newValue) => {
                handleChangePCWeightTicketDetail('shippingUnit', newValue?.code ?? '');
              }}
              renderInput={(params) => <TextField {...params} placeholder="Chọn đơn vị vận chuyển" />}
              componentsProps={{
                popupIndicator: {
                  title: intl.formatMessage({
                    id: 'open_dropdown_text'
                  })
                }
              }}
            />
          </Stack>
        </Grid>

        {/* transportPrice */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Đơn Giá Vận Tải</InputLabel>
            <TextField
              type="number"
              name="transportPrice"
              value={weightTicketState?.weightTicketItem?.transportPrice}
              disabled
              placeholder="Đơn Giá Vận Tải"
              fullWidth
            />
          </Stack>
        </Grid>
        {/* unloadingYard */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Bãi Hạ</InputLabel>
            <TextField
              name="unloadingYard"
              value={weightTicketState?.weightTicketItem?.unloadingYard}
              placeholder="Nhập bãi hạ"
              fullWidth
              onChange={(e) => {
                handleChangePCWeightTicketDetail('unloadingYard', e?.target?.value ?? '');
              }}
            />
          </Stack>
        </Grid>
        {/* truckNumber */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Biển Số Xe</InputLabel>
            <TextField
              name="truckNumber"
              value={weightTicketState?.weightTicketItem?.truckNumber}
              onChange={(e) => {
                handleChangePCWeightTicketDetail('truckNumber', e?.target?.value ?? '');
              }}
              placeholder="Nhập biển số xe"
              fullWidth
            />
          </Stack>
        </Grid>
        {/* containerNumber */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Số Cont</InputLabel>
            <TextField
              name="containerNumber"
              value={weightTicketState?.weightTicketItem?.containerNumber}
              onChange={(e) => {
                handleChangePCWeightTicketDetail('containerNumber', e?.target?.value ?? '');
              }}
              placeholder="Nhập số cont"
              fullWidth
            />
          </Stack>
        </Grid>
        {/* sealNumber */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Số Chì</InputLabel>
            <TextField
              name="sealNumber"
              placeholder="Nhập số chì"
              fullWidth
              value={weightTicketState?.weightTicketItem?.sealNumber}
              onChange={(e) => {
                handleChangePCWeightTicketDetail('sealNumber', e?.target?.value ?? '');
              }}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleAddPCWeightTicketDetail} sx={{ mt: 2 }}>
          Thêm
        </Button>
      </Grid>
      <Divider sx={{ my: 4 }} />

      {/* Section 2: Hàng phủ */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Hàng phủ
      </Typography>
      <Grid container spacing={3}>
        {/* coveredFactory */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Xưởng được phủ</InputLabel>
            <TextField
              name="coveredFactory"
              placeholder="Xưởng cấp hàng phủ"
              fullWidth
              value={weightTicketState?.weightTicket?.coveredFactory}
              onChange={(e) => {
                handleChangePCWeightTicket('coveredFactory', e?.target?.value ?? '');
              }}
            />
          </Stack>
        </Grid>
        {/* coveringFactory */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Xưởng cấp hàng phủ</InputLabel>
            <TextField
              name="coveringFactory"
              placeholder="Xưởng cấp hàng phủ"
              fullWidth
              value={weightTicketState?.weightTicket?.coveringFactory}
              onChange={(e) => {
                handleChangePCWeightTicket('coveringFactory', e?.target?.value ?? '');
              }}
            />
          </Stack>
        </Grid>
        {/* qualityType */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Loại chất lượng</InputLabel>
            <TextField
              type="text"
              name="qualityType"
              placeholder="Loại chất lượng"
              fullWidth
              value={weightTicketState?.weightTicket?.qualityType}
              onChange={(e) => {
                handleChangePCWeightTicket('qualityType', e?.target?.value);
              }}
            />
          </Stack>
        </Grid>
        {/* coverageQuantity */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Số lượng hàng phủ</InputLabel>
            <TextField
              type="number"
              name="coverageQuantity"
              placeholder="Số lượng hàng phủ"
              fullWidth
              value={weightTicketState?.weightTicket?.coverageQuantity}
              onChange={(e) => {
                handleChangePCWeightTicket('coverageQuantity', Number(e?.target?.value));
              }}
              inputProps={{ min: 0, step: 1 }}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Ngày phủ</InputLabel>
            <TextField
              type="date"
              value={
                weightTicketState?.weightTicket?.coverageDate
                  ? moment(weightTicketState?.weightTicket?.coverageDate).format('yyyy-MM-DD')
                  : moment().format('yyyy-MM-DD')
              }
              onChange={(e) => {
                const date = moment(e.target.value).toISOString();
                handleChangePCWeightTicket('coverageDate', date);
              }}
              placeholder="Ngày phủ"
              fullWidth
            />
          </Stack>
        </Grid>
      </Grid>

      {/*section 3*/}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Tổng hợp
      </Typography>
      <Grid container spacing={3}>
        {/* goodsWeight */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Trọng lượng hàng hóa</InputLabel>
            <TextField
              type="number"
              name="coverageReason"
              value={weightTicketState?.weightTicket?.goodsWeight}
              disabled
              placeholder="Nhập trọng lượng hàng hóa"
              fullWidth
            />
          </Stack>
        </Grid>
        {/* averageUnitPrice */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack gap={1}>
            <InputLabel>Giá đơn vị trung bình</InputLabel>
            <TextField
              type="number"
              name="averageUnitPrice"
              value={weightTicketState?.weightTicket?.averageUnitPrice ?? 0}
              disabled
              placeholder="Nhập Giá đơn vị trung bình"
              fullWidth
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSavePCWeightTicket} sx={{ mt: 2 }}>
          Lưu
        </Button>
      </Grid>
    </>
  );
});

export default WeightSlipForm;
