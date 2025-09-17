import { useEffect, useMemo, useState } from 'react';
import {
  TextField,
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  TableContainer,
  Autocomplete
} from '@mui/material';
import { PlusOutlined as AddIcon, DeleteOutlined as DeleteIcon } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import { useGlobal } from 'contexts/GlobalContext';
import { Formik, FieldArray } from 'formik';
import { useIntl } from 'react-intl';
import { mapGoodTypesFromConfig } from 'utils/mapGoodTypesFromConfig';
import { PURCHASE_GOOD_API } from 'api/constants';
import { enqueueSnackbar } from 'notistack';
interface GoodsListProps {
  onItemsChange: (items: TGood[]) => void;
  purchaseContractId: number | null | undefined;
  isReadOnly: boolean;
}

interface TGood {
  id: number;
  goodId: number;
  goodType: string;
  unitPrice: number;
  notes: string;
}

const GoodsList = ({ onItemsChange, purchaseContractId, isReadOnly }: GoodsListProps) => {
  const intl = useIntl();
  const { goods, configs } = useGlobal(); // lay bien global context

  const qualityTypesData = configs && configs.length > 0 ? mapGoodTypesFromConfig(configs) : [];

  const [goodList, setGoodList] = useState<TGood[]>([
    {
      id: 0,
      goodId: 0,
      goodType: '',
      unitPrice: 0,
      notes: ''
    }
  ]);

  useEffect(() => {
    fetchGetListBusinessPlanSupplier(purchaseContractId);
  }, [purchaseContractId]);

  const fetchGetListBusinessPlanSupplier = async (id: number | null | undefined) => {
    if (!id) return;
    try {
      const { data, status } = await axiosServices.get(PURCHASE_GOOD_API.COMMON + `?PurchaseContractId=${id}`);
      if (status === 200 || status === 201) {
        const formatData = data.data?.map((item: any) => {
          return {
            id: item?.id,
            goodId: item?.goodId,
            goodType: item?.goodType,
            unitPrice: item?.unitPrice,
            notes: item?.notes
          };
        });
        setGoodList(formatData);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
    }
  };

  const initialValues = useMemo(
    () => ({
      listGoods: goodList
    }),
    [goodList]
  );

  const createNewGood = async (func: Function) => {
    try {
      const { status } = await axiosServices.post(PURCHASE_GOOD_API.COMMON, {
        purchaseContractId,
        goodId: 3,
        goodType: 'type_a',
        unitPrice: 0,
        notes: ''
      });
      if (status === 200 || status === 201) {
        func();
        fetchGetListBusinessPlanSupplier(purchaseContractId);
        enqueueSnackbar(intl.formatMessage({ id: 'common_create_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  // console.log("listSupplier___haha", goodList)
  return (
    <Formik initialValues={initialValues} enableReinitialize={true} onSubmit={() => {}}>
      {({ values, ...rest }) => {
        return (
          <FieldArray name="listGoods">
            {({ insert, remove, push }) => (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6"> {intl.formatMessage({ id: 'good_list' })}</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      createNewGood(() =>
                        push({
                          goodId: 0,
                          goodType: '',
                          unitPrice: 0,
                          notes: ''
                        })
                      );
                    }}
                  >
                    {intl.formatMessage({ id: 'add_more' })}
                  </Button>
                </Box>
                <Box sx={{ width: '100%', overflow: 'hidden' }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 220 }}>{intl.formatMessage({ id: 'good_type' })}</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>{intl.formatMessage({ id: 'good_quality' })}</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>{intl.formatMessage({ id: 'good_unitprice' })}</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>{intl.formatMessage({ id: 'good_notes' })}</TableCell>
                          <TableCell width={50}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {values.listGoods.length > 0 &&
                          values.listGoods.map((good: TGood, index: number) => {
                            return (
                              <TableRow key={index}>
                                <TableCell width={300}>
                                  <Autocomplete
                                    readOnly={isReadOnly}
                                    options={goods}
                                    getOptionLabel={(option) => option.name}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={goods.find((item) => item.id === good.goodId) || null}
                                    onChange={(_, newValue) => {
                                      rest.setFieldValue(`listGoods.${index}.goodId`, newValue ? newValue.id : null);
                                      onItemsChange(values.listGoods);
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        name={`listGoods.${index}.goodId`}
                                        placeholder="Chọn loại hàng"
                                        // error={Boolean(getFieldError(`items.${index}.goodsType`))}
                                        // helperText={getFieldError(`items.${index}.goodsType`)}
                                        fullWidth
                                      />
                                    )}
                                    componentsProps={{
                                      popupIndicator: {
                                        title: intl.formatMessage({ id: 'open_dropdown_text' })
                                      },
                                      clearIndicator: {
                                        title: intl.formatMessage({ id: 'clear_text' })
                                      }
                                    }}
                                    sx={{ minWidth: 200 }}
                                  />
                                </TableCell>
                                <TableCell width={400}>
                                  <Autocomplete
                                    readOnly={isReadOnly}
                                    options={qualityTypesData}
                                    getOptionLabel={(option) => option.label}
                                    value={qualityTypesData.find((type) => type.value === good.goodType) || null}
                                    onChange={(_, newValue) => {
                                      rest.setFieldValue(`listGoods.${index}.goodType`, newValue ? newValue.value : null);
                                      onItemsChange(values.listGoods);
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        name={`listGoods.${index}.goodType`}
                                        placeholder={intl.formatMessage({ id: 'good_quality' })}
                                      />
                                    )}
                                    componentsProps={{
                                      popupIndicator: {
                                        title: intl.formatMessage({ id: 'open_dropdown_text' })
                                      },
                                      clearIndicator: {
                                        title: intl.formatMessage({ id: 'clear_text' })
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell width={100}>
                                  <TextField
                                    slotProps={{
                                      input: { readOnly: isReadOnly }
                                    }}
                                    name={`listGoods.${index}.unitPrice`}
                                    value={good.unitPrice}
                                    placeholder={intl.formatMessage({ id: 'good_unitprice' })}
                                    onChange={(newValue) => {
                                      rest.handleChange(newValue);
                                      onItemsChange(values.listGoods);
                                    }}
                                    type="number"
                                    // error={Boolean(getFieldError(`items.${index}.price`))}
                                    // helperText={getFieldError(`items.${index}.price`)}
                                    fullWidth
                                  />
                                </TableCell>

                                <TableCell>
                                  <TextField
                                    slotProps={{
                                      input: { readOnly: isReadOnly }
                                    }}
                                    name={`listGoods.${index}.notes`}
                                    value={good.notes}
                                    onChange={(newValue) => {
                                      // rest.setFieldValue(`listGoods.${index}.notes`, newValue)
                                      rest.handleChange(newValue);
                                      onItemsChange(values.listGoods);
                                    }}
                                    placeholder={intl.formatMessage({ id: 'good_notes' })}
                                    // error={Boolean(getFieldError(`items.${index}.note`))}
                                    // helperText={getFieldError(`items.${index}.note`)}
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton onClick={() => remove(index)} color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
          </FieldArray>
        );
      }}
    </Formik>
  );
};

export default GoodsList;
