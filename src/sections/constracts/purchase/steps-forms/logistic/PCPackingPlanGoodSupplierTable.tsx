import { useEffect, useState } from 'react';
import {
  TextField,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  TableContainer,
  Autocomplete,
  Chip
} from '@mui/material';
import { PlusOutlined as AddIcon, EditOutlined } from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import {
  actionCreatePCPackingPlanGoodSupplier,
  actionDeletePCPackingPlanGoodSupplierByID,
  actionFetchPCPackingPlanGoodSuppliers,
  actionUpdatePCPackingPlanGoodSupplier,
  logisticSelector,
  setPCPackingPlanGoodSuppliers,
  TLogisticState
} from 'redux/Logistic';
import { useGlobal } from 'contexts/GlobalContext';
import { goodFormat } from 'utils/formatGood';
import { useIntl } from 'react-intl';
import { supplierFormat } from 'utils/formatSupplier';
import { PCPackingPlanGoodSupplier } from 'types/contracts/purchase/logistic';
import { DeleteOutlined, CheckOutlined as Check } from '@ant-design/icons';
import { pick } from 'lodash';
import moment from 'moment';
import { IShippingPurchaseContract } from 'types/logistcs';
import { PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';
import axiosServices from 'utils/axios';
import { enqueueSnackbar } from 'notistack';

interface PCPackingPlanGoodSupplierTableProps {
  caculateTotal: () => void;
}

const PCPackingPlanGoodSupplierTable = ({ caculateTotal }: PCPackingPlanGoodSupplierTableProps) => {
  const dispatch = useDispatch();
  const logisticState: TLogisticState = useSelector(logisticSelector);
  const { goods, suppliers } = useGlobal();
  const goodFormatData = goodFormat(goods);
  const supplierFormatData = supplierFormat(suppliers);
  const [isAddNew, setIsAddNew] = useState<boolean>(false);
  const [isEdits, setIsEdits] = useState<boolean[]>([]);
  const intl = useIntl();

  const refresh = () => {
    if (logisticState.purchaseContract?.purchaseContractPackingPlan && logisticState.purchaseContract.purchaseContractPackingPlan.id >= 0) {
      dispatch(
        actionFetchPCPackingPlanGoodSuppliers({
          contractPlanId: logisticState.purchaseContract.purchaseContractPackingPlan?.id
        })
      );

      if (logisticState.pcPackingPlans.length > 0) {
        setIsEdits(logisticState.pcPackingPlans.map((item) => false));
      }
    } else {
      dispatch(setPCPackingPlanGoodSuppliers([...(logisticState?.pcPackingPlans ?? [])]));
    }

    caculateTotal();
  };

  useEffect(() => {
    refresh();
  }, [dispatch, logisticState.purchaseContract]);

  const handleAdd = () => {
    setIsAddNew(true);
    const newTable = [
      ...logisticState.pcPackingPlans,
      {
        id: -1,
        createdAt: '',
        lastUpdatedAt: '',
        createdBy: 0,
        lastUpdatedBy: 0,
        lastProgramUpdate: '',
        code: logisticState.purchaseContract.code,
        status: 0,
        lastUpdatedProgram: '',
        supplierId: 0,
        goodId: 0,
        shippingScheduleId: 0,
        quantity: 0,
        quality: 0,
        startTime: '',
        endTime: '',
        realQuanity: 0,
        contractPlanId: logisticState.purchaseContractPackingPlan.id
      }
    ];
    if (newTable.length > 0) {
      const edits = newTable.map((item) => false);
      edits[newTable.length - 1] = true;
      setIsEdits(edits);
    }
    dispatch(setPCPackingPlanGoodSuppliers(newTable));
  };

  const handleRemove = (index: number) => {
    const updatedPlans = [...logisticState.pcPackingPlans];

    if (logisticState?.purchaseContract?.purchaseContractPackingPlan) {
      if (updatedPlans[index].id > -1) {
        dispatch(actionDeletePCPackingPlanGoodSupplierByID(logisticState.pcPackingPlans[index].id));
        const updatedRows = updatedPlans.filter((_, i) => i !== index);
        dispatch(setPCPackingPlanGoodSuppliers(updatedRows));
      } else {
        const updatedRows = updatedPlans.filter((_, i) => i !== index);
        dispatch(setPCPackingPlanGoodSuppliers(updatedRows));
      }
    } else {
      const updatedRows = updatedPlans.filter((_, i) => i !== index);
      dispatch(setPCPackingPlanGoodSuppliers(updatedRows));
    }
  };

  const handleRowChange = (index: number, field: keyof PCPackingPlanGoodSupplier, value: any) => {
    const updatedPlans = [...logisticState.pcPackingPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value
    };
    dispatch(setPCPackingPlanGoodSuppliers(updatedPlans));
  };

  const handleEdit = (index: number) => {
    const isEditsArr = [...isEdits];
    isEditsArr[index] = true;
    setIsEdits(isEditsArr);
    setIsAddNew(false);
  };

  const handleSave = (index: number) => {
    const fields = [
      'code',
      'status',
      'lastUpdatedProgram',
      'supplierId',
      'goodId',
      'shippingScheduleId',
      'quantity',
      'quality',
      'startTime',
      'endTime',
      'realQuanity',
      'contractPlanId'
    ];

    if (isAddNew) {
      setIsAddNew(false);
      if (
        logisticState.purchaseContract?.purchaseContractPackingPlan &&
        logisticState.purchaseContract.purchaseContractPackingPlan.id >= 0
      ) {
        const itemCreate = pick(
          {
            ...logisticState.pcPackingPlans[index],
            contractPlanId: logisticState.purchaseContract.purchaseContractPackingPlan.id
          },
          fields
        );
        dispatch(actionCreatePCPackingPlanGoodSupplier(itemCreate));
      } else {
        const updatedPlans = [...logisticState.pcPackingPlans];
        dispatch(setPCPackingPlanGoodSuppliers([...updatedPlans, logisticState.pcPackingPlans[index]]));
      }
    } else {
      if (logisticState?.purchaseContractPackingPlan && logisticState.purchaseContractPackingPlan?.id > -1) {
        const itemUpdate = pick<Partial<PCPackingPlanGoodSupplier>>(
          {
            ...logisticState.pcPackingPlans[index],
            contractPlanId: logisticState.purchaseContractPackingPlan?.id
          },
          fields
        );
        dispatch(
          actionUpdatePCPackingPlanGoodSupplier({
            id: logisticState.pcPackingPlans[index].id,
            data: itemUpdate
          })
        );
      } else {
        const updatedPlans = [...logisticState.pcPackingPlans];
        updatedPlans[index] = logisticState.pcPackingPlans[index];
        dispatch(setPCPackingPlanGoodSuppliers(updatedPlans));
      }
    }
    const isEditsArr = [...isEdits];
    isEditsArr[index] = false;
    setIsEdits(isEditsArr);
    refresh();
  };

  const [listShippingSchedule, setListShippingSchedule] = useState<IShippingPurchaseContract[]>([]);
  useEffect(() => {
    getListShippingList();
  }, [logisticState.contract]);
  const getListShippingList = async () => {
    try {
      const { data, status } = await axiosServices.get(
        PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON +
          `?PurchaseContractId=${logisticState.contract.purchaseContractId}&BookingNumber=${(logisticState.contract as any).bookingNumber}`
      );
      if (status === 200 || status === 201) {
        setListShippingSchedule(data.data);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'get_list_shipping_schedule_fail' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  return (
    <Box>
      <Box sx={{ width: '100%', overflow: 'auto', maxHeight: '600px' }}>
        <TableContainer component={Paper} sx={{ minWidth: 1200 }}>
          <Table sx={{ minWidth: 1200 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 180, maxWidth: 200 }}>Tên hàng hóa</TableCell>
                <TableCell sx={{ minWidth: 180, maxWidth: 200 }}>Tên Xưởng/nhà máy</TableCell>
                <TableCell sx={{ minWidth: 120, maxWidth: 150 }}>Số lượng</TableCell>
                <TableCell sx={{ minWidth: 120, maxWidth: 150 }}>Số lượng thật</TableCell>
                <TableCell sx={{ minWidth: 140, maxWidth: 160 }}>Loại chất lượng</TableCell>
                <TableCell sx={{ minWidth: 200, maxWidth: 250 }}>Vận chuyển</TableCell>
                <TableCell sx={{ minWidth: 150, maxWidth: 180 }}>Thời gian bắt đầu</TableCell>
                <TableCell sx={{ minWidth: 150, maxWidth: 180 }}>Thời gian kết thúc</TableCell>
                <TableCell
                  sx={{
                    minWidth: 80,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    textAlign: 'center',
                    columnSpan: '2'
                  }}
                  colSpan={2}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logisticState.pcPackingPlans.map((row, index) => (
                <TableRow key={index} hover>
                  {/*goodId*/}
                  <TableCell>
                    {isEdits[index] ? (
                      <Autocomplete
                        options={goods}
                        getOptionLabel={(option) => `${option.brand} - ${option.name}`}
                        value={goods.find((good) => good.id === row.goodId) || null}
                        onChange={(e, newValue) => handleRowChange(index, 'goodId', newValue?.id ?? 0)}
                        renderInput={(params) => <TextField {...params} placeholder="Chọn hàng hóa" />}
                        componentsProps={{
                          popupIndicator: {
                            title: intl.formatMessage({
                              id: 'open_dropdown_text'
                            })
                          }
                        }}
                      />
                    ) : (
                      <Chip
                        label={goodFormatData?.[`${row.goodId}`]?.name ?? ''}
                        color={goodFormatData?.[`${row.goodId}`]?.color ?? 'primary'}
                        size="small"
                        variant="light"
                      />
                    )}
                  </TableCell>

                  {/*supplier*/}
                  <TableCell>
                    {isEdits[index] ? (
                      <Autocomplete
                        options={suppliers}
                        getOptionLabel={(option) => `${option.name} - ${option.address}`}
                        value={suppliers.find((supplier) => supplier.id === row.supplierId) || null}
                        onChange={(e, newValue) => handleRowChange(index, 'supplierId', newValue?.id ?? 0)}
                        renderInput={(params) => <TextField {...params} placeholder="Chọn Xưởng / Nhà Máy" />}
                        componentsProps={{
                          popupIndicator: {
                            title: intl.formatMessage({
                              id: 'open_dropdown_text'
                            })
                          }
                        }}
                      />
                    ) : (
                      <Chip label={supplierFormatData?.[`${row.supplierId}`]?.name ?? ''} size="small" variant="light" />
                    )}
                  </TableCell>

                  {/*quantity*/}
                  <TableCell>
                    <TextField
                      slotProps={{
                        input: {
                          readOnly: !isEdits[index]
                        }
                      }}
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Số lượng"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </TableCell>

                  {/*realQuanity*/}
                  <TableCell>
                    <TextField
                      slotProps={{
                        input: {
                          readOnly: !isEdits[index]
                        }
                      }}
                      type="number"
                      value={row.realQuanity}
                      onChange={(e) => handleRowChange(index, 'realQuanity', Number(e.target.value))}
                      placeholder="Số lượng thật"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </TableCell>

                  {/*quality*/}
                  <TableCell>
                    <TextField
                      slotProps={{
                        input: {
                          readOnly: !isEdits[index]
                        }
                      }}
                      type="number"
                      value={row.quality}
                      onChange={(e) => handleRowChange(index, 'quality', Number(e.target.value))}
                      placeholder="Loại chất lượng"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </TableCell>

                  {/*shippingScheduleId*/}
                  <TableCell>
                    {/* <TextField
                        slotProps={{
                          input: {
                            readOnly: !isEdits[index]
                          }
                        }}
                        type="number"
                        value={row.shippingScheduleId}
                        onChange={(e) => handleRowChange(index, 'shippingScheduleId', Number(e.target.value))}
                        placeholder="Loại chất lượng"
                        fullWidth
                        inputProps={{ min: 0, step: 1 }}
                      /> */}
                    <Autocomplete
                      options={listShippingSchedule}
                      getOptionLabel={(option) => option.shipName}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={listShippingSchedule.find((item) => item.id === row.shippingScheduleId)?.id as any}
                      onChange={(_, newsValue) => {
                        // console.log("listShippingSchedule__data", newsValue)
                        handleRowChange(index, 'shippingScheduleId', newsValue.id);
                      }}
                      renderInput={(params) => <TextField {...params} name="shippingScheduleId" placeholder="Lựa chọn vận chuyển" />}
                    />
                  </TableCell>

                  {/*startTime*/}
                  <TableCell>
                    <TextField
                      slotProps={{
                        input: {
                          readOnly: !isEdits[index]
                        }
                      }}
                      type="date"
                      value={moment(row.startTime).format('yyyy-MM-DD')}
                      onChange={(e) => {
                        const date = moment(e.target.value).toISOString();
                        handleRowChange(index, 'startTime', date);
                      }}
                      placeholder="Thời gian bắt đầu"
                      fullWidth
                    />
                  </TableCell>

                  {/*endTime*/}
                  <TableCell>
                    <TextField
                      slotProps={{
                        input: {
                          readOnly: !isEdits[index]
                        }
                      }}
                      type="date"
                      value={moment(row.endTime).format('yyyy-MM-DD')}
                      onChange={(e) => {
                        const date = moment(e.target.value).toISOString();
                        handleRowChange(index, 'endTime', date);
                      }}
                      placeholder="Thời gian kết thúc"
                      fullWidth
                    />
                  </TableCell>

                  {isEdits[index] ? (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton color="success" onClick={() => handleSave(index)} disabled={logisticState.pcPackingPlans.length === 0}>
                        <Check />
                      </IconButton>
                    </TableCell>
                  ) : (
                    <></>
                  )}

                  {!isEdits[index] ? (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton color="primary" onClick={() => handleEdit(index)} disabled={logisticState.pcPackingPlans.length === 0}>
                        <EditOutlined />
                      </IconButton>
                    </TableCell>
                  ) : (
                    <></>
                  )}

                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="error" onClick={() => handleRemove(index)} disabled={logisticState.pcPackingPlans.length === 0}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleAdd()} sx={{ mt: 2 }}>
        Thêm xưởng
      </Button>
    </Box>
  );
};

export default PCPackingPlanGoodSupplierTable;
