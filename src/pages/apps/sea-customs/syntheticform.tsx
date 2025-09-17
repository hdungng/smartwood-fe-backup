import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  IconButton,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import { TableRowData } from './models';

export interface SyntheticFormData {
  code: string;
  status: number;
  lastUpdatedProgram: string;
  locationCode: string;
  endLocationCode: string;
  totalTaxableValue: number | null;
  estimatedDepartureDate: Dayjs | null;
  shippingDepartureDate: Dayjs | null;
}
interface SyntheticFormProps {
  open: boolean;
  onClose: () => void;
  data: TableRowData | null;
  onSubmit: (formData: SyntheticFormData) => void; // Thêm tham số formData
}

export const SyntheticForm = ({ open, onClose, data, onSubmit }: SyntheticFormProps) => {
  const [syntheticData, setSyntheticData] = useState<SyntheticFormData>({
    code: '',
    status: 1,
    lastUpdatedProgram: 'CustomSeaList',
    locationCode: '',
    endLocationCode: '',
    totalTaxableValue: null,
    estimatedDepartureDate: null,
    shippingDepartureDate: null
  });

  const handleSubmit = () => {
    onSubmit(syntheticData); // Truyền dữ liệu form khi submit
    onClose(); // Đóng dialog sau khi submit
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {' '}
        {/* Sử dụng prop 'open' */}
        <DialogTitle sx={{ margin: 'auto', textAlgin: 'center' }}>Thông Tin Bổ Sung</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Các trường form giữ nguyên, loại bỏ code, status, lastUpdatedProgram */}
            <TextField
              label="Location Code"
              value={syntheticData.locationCode}
              onChange={(e) => setSyntheticData({ ...syntheticData, locationCode: e.target.value })}
              fullWidth
            />
            <TextField
              label="End Location Code"
              value={syntheticData.endLocationCode}
              onChange={(e) => setSyntheticData({ ...syntheticData, endLocationCode: e.target.value })}
              fullWidth
            />
            <TextField
              label="Total Taxable Value"
              type="number"
              value={syntheticData.totalTaxableValue}
              onChange={(e) =>
                setSyntheticData({ ...syntheticData, totalTaxableValue: e.target.value === '' ? null : Number(e.target.value) })
              }
              fullWidth
            />
            <DatePicker
              label="Estimated Departure Date"
              value={syntheticData.estimatedDepartureDate}
              onChange={(newValue) =>
                setSyntheticData({
                  ...syntheticData,
                  estimatedDepartureDate: newValue ? dayjs(newValue) : null
                })
              }
            />
            <DatePicker
              label="Shipping Departure Date"
              value={syntheticData.shippingDepartureDate}
              onChange={(newValue) =>
                setSyntheticData({
                  ...syntheticData,
                  shippingDepartureDate: newValue ? dayjs(newValue) : null
                })
              }
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end', flexDirection: 'columns' }}>
            <Button sx={{ flex: 1 }} onClick={onClose} variant="outlined" color="error">
              Hủy
            </Button>
            <Button sx={{ flex: 1 }} onClick={handleSubmit} variant="outlined" color="primary">
              Thực hiện ECUS
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SyntheticForm;
