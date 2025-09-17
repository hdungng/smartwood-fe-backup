import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

import { GoodSupplier } from '../../../types/good-supplier';
import { goodSupplierService } from '../../../api/good-supplier';
import { Good } from 'types/good';
import { Supplier } from 'types/supplier';
import { openSnackbar } from 'api/snackbar';

interface GoodSupplierFormProps {
  goods?: Good[] | null;
  suppliers?: Supplier[] | null;
  goodSupplier?: GoodSupplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormState = {
  goodId: number | null;
  supplierId: number | null;
  unitPrice: number | '' | null;
  goodType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  note?: string;
};

const initialState: FormState = {
  goodId: null,
  supplierId: null,
  unitPrice: '',
  goodType: '',
  startDate: null,
  endDate: null,
  note: ''
};

const GoodSupplierForm: React.FC<GoodSupplierFormProps> = ({ goods, suppliers, goodSupplier, onSuccess, onCancel }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  // Lọc chỉ lấy goods và suppliers có status = 1 (active)
  const activeGoods = useMemo(() => {
    return (goods || []).filter(good => good.status === 1);
  }, [goods]);

  const activeSuppliers = useMemo(() => {
    return (suppliers || []).filter(supplier => supplier.status === 1);
  }, [suppliers]);

  useEffect(() => {
    if (goodSupplier) {
      setForm({
        goodId: goodSupplier.goodId ?? null,
        supplierId: goodSupplier.supplierId ?? null,
        unitPrice: typeof goodSupplier.unitPrice === 'number' ? goodSupplier.unitPrice : '',
        goodType: goodSupplier.goodType || '',
        startDate: goodSupplier.startDate ? dayjs(goodSupplier.startDate) : null,
        endDate: goodSupplier.endDate ? dayjs(goodSupplier.endDate) : null,
        note: ''
      });
    } else {
      setForm(initialState);
    }
  }, [goodSupplier]);

  const selectedGood = useMemo(() => activeGoods?.find((g) => g.id === form.goodId) || null, [activeGoods, form.goodId]);
  const selectedSupplier = useMemo(
    () => activeSuppliers?.find((s) => s.id === form.supplierId) || null,
    [activeSuppliers, form.supplierId]
  );

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: key === 'unitPrice' ? (value === '' ? '' : Number(value)) : value
      }));
    };

  const validate = (): string | null => {
    if (!form.goodId) return 'Vui lòng chọn Hàng hóa';
    if (!form.supplierId) return 'Vui lòng chọn Nhà cung cấp';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      openSnackbar({ open: true, message: error, variant: 'alert', alert: { color: 'error' } } as any);
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        goodId: form.goodId!,
        supplierId: form.supplierId!,
        unitPrice: form.unitPrice === '' || form.unitPrice == null ? undefined : Number(form.unitPrice),
        goodType: form.goodType?.trim() || undefined,
        startDate: form.startDate ? form.startDate.format('YYYY-MM-DD') : undefined,
        endDate: form.endDate ? form.endDate.format('YYYY-MM-DD') : undefined
      };
      if (goodSupplier) {
        await goodSupplierService.updateGoodSupplier(goodSupplier.id, payload as any);
        openSnackbar({ open: true, message: 'Cập nhật thành công', variant: 'alert', alert: { color: 'success' } } as any);
      } else {
        await goodSupplierService.createGoodSupplier(payload as any);
        openSnackbar({ open: true, message: 'Tạo mới thành công', variant: 'alert', alert: { color: 'success' } } as any);
      }
      onSuccess();
    } catch (e: any) {
      openSnackbar({
        open: true,
        message: e?.response?.data?.message || e?.message || 'Thao tác thất bại',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {/* Hiển thị mã sản phẩm theo Hàng hóa đã chọn */}
      {/* <TextField
        label="Mã hàng hóa"
        value={selectedGood?.code || ''}
        fullWidth
        size="medium"
        disabled
      /> */}
      <FormHelperText sx={{ mt: -1 }}>Tự hiển thị theo Hàng hóa đã chọn</FormHelperText>

      {/* Hàng 1: Hàng hóa - Số tiền (đơn giá) */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            options={activeGoods as Good[]}
            value={selectedGood}
            onChange={(_, val) => setForm((prev) => ({ ...prev, goodId: val?.id ?? null }))}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            renderInput={(params) => (
              <TextField {...params} label="Hàng hóa *" placeholder="Chọn hàng hóa" fullWidth size="medium" />
            )}
          />
          <FormHelperText sx={{ mt: 0.5 }}>Chọn hàng hóa cần áp giá nhà cung cấp</FormHelperText>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Số tiền (đơn giá)"
            placeholder="Nhập đơn giá"
            type="number"
            value={form.unitPrice === '' || form.unitPrice == null ? '' : form.unitPrice}
            onChange={handleChange('unitPrice')}
            fullWidth
            size="medium"
            inputProps={{ min: 0, step: '0.01' }}
          />
          <FormHelperText sx={{ mt: 0.5 }}>Sử dụng số dương (VND). Tối đa 2 chữ số thập phân</FormHelperText>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={activeSuppliers as Supplier[]}
            value={selectedSupplier}
            onChange={(_, val) => setForm((prev) => ({ ...prev, supplierId: val?.id ?? null }))}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            renderInput={(params) => (
              <TextField {...params} label="Nhà cung cấp *" placeholder="Chọn nhà cung cấp" fullWidth size="medium" />
            )}
          />
          <FormHelperText sx={{ mt: 0.5 }}>Chọn nhà cung cấp áp dụng đơn giá</FormHelperText>
        </Grid>

        {/* Hàng 2: Loại hàng */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Loại hàng"
            placeholder="Nhập loại hàng (tùy chọn)"
            value={form.goodType}
            onChange={handleChange('goodType')}
            fullWidth
            size="medium"
            inputProps={{ maxLength: 255 }}
          />
        </Grid>

        {/* (Đã bỏ ô nhập Mã sản phẩm vì BE tự tạo) */}

        {/* Hàng 3: Ngày bắt đầu - Ngày kết thúc */}
        <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
  label="Ngày bắt đầu"
  value={form.startDate}
  onChange={(value, _ctx) => setForm((prev) => ({ ...prev, startDate: value as Dayjs | null }))}
  format="DD/MM/YYYY"
  slotProps={{ textField: { size: 'medium', fullWidth: true, placeholder: 'dd/MM/yyyy' } }}
/>
          <FormHelperText sx={{ mt: 0.5 }}>Bỏ trống nếu áp dụng ngay</FormHelperText>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
  label="Ngày kết thúc"
  value={form.endDate}
  onChange={(value, _ctx) => setForm((prev) => ({ ...prev, endDate: value as Dayjs | null }))}
  format="DD/MM/YYYY"
  slotProps={{ textField: { size: 'medium', fullWidth: true, placeholder: 'dd/MM/yyyy' } }}
/>
          <FormHelperText sx={{ mt: 0.5 }}>Bỏ trống nếu không giới hạn thời gian</FormHelperText>
        </Grid>

        {/* Hàng 4: Ghi chú chi tiết */}
        {/* <Grid size={{ xs: 12 }}>
          <TextField
            label="Ghi chú chi tiết"
            placeholder="Nhập ghi chú (nếu có)"
            value={form.note}
            onChange={handleChange('note')}
            fullWidth
            size="medium"
            minRows={3}
            multiline
          />
        </Grid> */}
      </Grid>

      {/* Actions */}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={submitting}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {goodSupplier ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default GoodSupplierForm;