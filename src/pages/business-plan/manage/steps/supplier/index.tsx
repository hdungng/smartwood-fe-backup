import { Form, useFormResolver } from 'forms';
import Typography from '@mui/material/Typography';
import { Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useBoolean, useConfirmLeave, useTranslation } from 'hooks';
import { SupplierFormProps, SupplierItemFormProps, supplierSchema } from '../../schema';
import { useFieldArray } from 'react-hook-form';
import { ButtonSave, SummarySection, SupplierRow, SupplierSummaryRow, ErrorTotalWeight, ErrorDuplicateInfo } from './components';
import { useEffect } from 'react';
import { COLUMN_WIDTHS, MAXIMUM_SUPPLIERS, TABLE_HEADER } from './constants';
import { SelectionOption } from 'types/common';
import { useBusinessPlanManageContext } from '../../provider';

import CircularProgress from '@mui/material/CircularProgress';
import { businessPlanService } from 'services/business-plan';
import { useGlobal, useToast } from 'contexts';
import { StepAction, StepActionHandler } from 'components/@extended/Steps';
import { objectHelper } from 'utils';
import { CustomButton } from 'components/buttons';

type Props = StepActionHandler;

const SupplierStep = ({ onBack, onNext }: Props) => {
  const { t } = useTranslation();
  const { confirmLeave } = useConfirmLeave();
  const { businessPlan, mode, fieldOnlyView, setTotalWeightSupplier } = useBusinessPlanManageContext();
  const { goodOptions, supplierOptions } = useGlobal();
  const toast = useToast();
  const initializing = useBoolean(true);

  const form = useFormResolver<SupplierFormProps>(supplierSchema);

  const {
    reset,
    getValues,
    control,
    trigger,
    formState: { dirtyFields }
  } = form;

  const {
    fields: suppliers,
    append,
    remove
  } = useFieldArray<SupplierFormProps>({
    control,
    name: 'suppliers'
  });

  const handleAddSupplier = () => {
    append(
      {
        good: goodOptions.find((x) => x.value === businessPlan?.draftPo?.goodId) || null
      },
      {
        shouldFocus: true
      }
    );
  };

  useEffect(() => {
    if (initializing.value || mode === 'view') return;

    if (suppliers.length === 0) {
      handleAddSupplier();
    }
  }, [suppliers, initializing.value, mode]);

  const handleFetchDefaultSupplier = async () => {
    const response = await businessPlanService.listSupplierOfBusinessPlan(businessPlan!.id);

    const suppliers = (response?.data || []).map((supplier) => ({
      ...supplier,
      region: supplier.region,
      good: goodOptions.find((x) => x.value === supplier.goodId) as SelectionOption,
      defaultValue: {
        goodType: supplier.goodType,
        exportPort: supplier.exportPort
      }
    })) as SupplierItemFormProps[];

    reset({
      ...getValues(),
      suppliers
    });

    const defaultTotalWeight = suppliers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
    setTotalWeightSupplier(defaultTotalWeight);

    if(suppliers.length >= 1) {
      setTimeout(async () => {
        await trigger();
      }, 200);
    }

  };

  useEffect(() => {
    if (!businessPlan?.id || goodOptions.length === 0 || supplierOptions.length === 0) {
      return;
    }

    (async () => {
      try {
        await handleFetchDefaultSupplier();
      } finally {
        initializing.onFalse();
      }
    })();
  }, [businessPlan?.id, goodOptions.length, supplierOptions.length]);

  const handleSubmit = async (values: SupplierFormProps, event: Dynamic) => {
    if (!businessPlan?.id) return;

    const suppliers = (values.suppliers || []).map(({ good, quantity, purchasePrice, ...otherSupplier }) => ({
      ...otherSupplier,
      quantity,
      purchasePrice,
      totalAmount: quantity * purchasePrice,
      goodId: Number(good?.value)
    }));

    const response = await businessPlanService.storeSupplier({
      businessPlanId: businessPlan.id,
      suppliers
    });

    if (!response?.success) {
      toast.error(response?.error || 'Đã xảy ra lỗi khi lưu thông tin nhà cung cấp. Vui lòng thử lại sau.');
      return;
    }

    const totalWeight = suppliers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
    setTotalWeightSupplier(totalWeight);

    reset(
      {
        ...getValues()
      },
      {
        keepValues: true,
        keepErrors: false,
        keepTouched: false
      }
    );

    const canNextStep = event?.nativeEvent?.submitter?.value === 'btn-save-continue';
    if (canNextStep) {
      onNext?.();
    } else {
      toast.success('Lưu thông tin nhà cung cấp thành công.');
    }
  };

  const handleBack = async () => {
    await confirmLeave(() => onBack?.(), !objectHelper.isEmpty(dirtyFields));
  };

  return (
    <Form methods={form} onSubmit={handleSubmit}>
      {initializing.value ? (
        <Stack justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight="bold">
              Thông tin nhà cung cấp
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Danh sách nhà cung cấp
              </Typography>

              {!fieldOnlyView && (
                <Button variant="contained" onClick={() => handleAddSupplier()}>
                  Thêm
                </Button>
              )}
            </Stack>
          </Stack>

          <TableContainer component={Paper}>
            <Table
              sx={{
                tableLayout: 'fixed',
                width: '100%'
              }}
            >
              <TableHead>
                <TableRow>
                  {TABLE_HEADER.map((head, index) => {
                    const widthMap = [
                      COLUMN_WIDTHS.goods,
                      COLUMN_WIDTHS.goodType,
                      COLUMN_WIDTHS.region,
                      COLUMN_WIDTHS.exportPort,
                      COLUMN_WIDTHS.quantity,
                      COLUMN_WIDTHS.price,
                      COLUMN_WIDTHS.total
                    ];

                    const currentWidth = widthMap[index] + (mode === 'view' ? COLUMN_WIDTHS.action / widthMap.length : 0);

                    return (
                      <TableCell
                        key={index}
                        sx={{
                          width: currentWidth,
                          minWidth: currentWidth,
                          fontWeight: 'bold',
                          backgroundColor: '#f5f5f5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'help'
                        }}
                      >
                        {t(head)}
                        {index !== 6 && <strong style={{ color: 'red' }}>*</strong>}
                      </TableCell>
                    );
                  })}
                  {!fieldOnlyView && (
                    <TableCell
                      sx={{
                        width: COLUMN_WIDTHS.action,
                        minWidth: COLUMN_WIDTHS.action,
                        maxWidth: COLUMN_WIDTHS.action,
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      Hành động
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              {suppliers.length > 0 ? (
                <TableBody>
                  {suppliers.map((supplier, index) => (
                    <SupplierRow
                      key={supplier.id}
                      index={index}
                      canRemove={suppliers.length > 1}
                      onAdd={() => {
                        if (suppliers.length >= MAXIMUM_SUPPLIERS) {
                          toast.error(`Nhà cung cấp đã đạt tối đa số lượng là ${MAXIMUM_SUPPLIERS}.`);
                          return;
                        }
                        handleAddSupplier();
                      }}
                      onRemove={() => remove(index)}
                    />
                  ))}

                  <SupplierSummaryRow />
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={Object.keys(COLUMN_WIDTHS).length - (mode === 'view' ? 1 : 0)} align="center" sx={{ padding: 4 }}>
                      <Typography variant="body1">Không có dữ liệu</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>

          <Typography variant="caption" fontStyle="italic" mt={-4}>
            Khi người dùng nhập dữ liệu đến ô thuộc cột cuối cùng và nhấn phím <strong>Enter</strong>, hệ thống sẽ tự động tạo thêm một dòng
            mới để tiếp tục nhập liệu.
          </Typography>

          <SummarySection />

          <ErrorTotalWeight />

          <ErrorDuplicateInfo />

          <StepAction
            slots={{
              next: (
                <Stack direction="row" spacing={1}>
                  {!fieldOnlyView ? (
                    <>
                      <ButtonSave id="btn-save" label="Lưu" />

                      <ButtonSave id="btn-save-continue" label="Lưu & Tiếp tục" />
                    </>
                  ) : (
                    <CustomButton variant="contained" color="primary" onClick={onNext}>
                      Tiếp tục
                    </CustomButton>
                  )}
                </Stack>
              )
            }}
            onBack={handleBack}
          />
        </Stack>
      )}
    </Form>
  );
};

export default SupplierStep;
