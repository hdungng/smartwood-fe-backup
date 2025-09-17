import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosServices from 'utils/axios';
import { EVALUATE_API } from 'api/constants';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  reportId: number;
  reportTitle: string;
  currentStatus: string;
  onSuccess: (newStatus: number, reason: string) => void;
}

const validationSchema = yup.object({
  status: yup.string().required('Vui lòng chọn trạng thái'),
  reason: yup.string().required('Vui lòng nhập lý do quyết định').min(10, 'Lý do phải có ít nhất 10 ký tự')
});

function mapStatusToText(status?: number | null): 'Đã phê duyệt' | 'Từ chối' | 'Chờ xử lý' {
  if (status === 1) return 'Chờ xử lý';
  if (status === 2) return 'Đã phê duyệt';
  if (status === 0) return 'Từ chối';
  return 'Chờ xử lý';
}

const ApprovalModal = ({ open, onClose, reportId, reportTitle, currentStatus, onSuccess }: ApprovalModalProps) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      status: '',
      reason: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const newStatus = values.status === 'Pass' ? 2 : 0;
        const payload = {
          status: newStatus,
          nodeDecided_Evaluate: values.reason,
          lastUpdatedProgram: 'FE Approval'
        };

        console.log('Sending approval payload:', { reportId, payload });
        const response = await axiosServices.put(`${EVALUATE_API.COMMON}/${reportId}`, payload);
        console.log('API response:', response.data);

        openSnackbar({
          open: true,
          message: 'Phê duyệt thành công!',
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        onSuccess(newStatus, values.reason);
        formik.resetForm();
        onClose();
      } catch (error: any) {
        console.error('Lỗi phê duyệt:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        openSnackbar({
          open: true,
          message: 'Lỗi khi phê duyệt báo cáo',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        component="div"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h5" component="h2">
          Phê duyệt báo cáo chất lượng
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Báo cáo:</strong> {reportTitle}
          </Typography>
          <Typography variant="body2">
            <strong>Trạng thái hiện tại:</strong> {currentStatus}
          </Typography>
        </Alert>
        <form onSubmit={formik.handleSubmit}>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Quyết định phê duyệt *
            </FormLabel>
            <RadioGroup name="status" value={formik.values.status} onChange={formik.handleChange} row>
              <FormControlLabel
                value="Pass"
                control={<Radio color="success" disabled={loading} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* <CheckCircleOutlined style={{ color: '#4caf50' }} /> */}
                    <Typography color="success.main">Chấp nhận (Pass)</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="Fail"
                control={<Radio color="error" disabled={loading} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* <CloseCircleOutlined style={{ color: '#f44336' }} /> */}
                    <Typography color="error.main">Từ chối (Fail)</Typography>
                  </Box>
                }
              />
            </RadioGroup>
            {formik.touched.status && formik.errors.status && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {formik.errors.status}
              </Typography>
            )}
          </FormControl>
          <TextField
            name="reason"
            label="Lý do quyết định *"
            placeholder="Nhập lý do chi tiết cho quyết định phê duyệt..."
            multiline
            rows={4}
            fullWidth
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          {formik.values.status === 'Pass' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Báo cáo sẽ được chấp nhận và chuyển sang trạng thái "Đã phê duyệt"
            </Alert>
          )}
          {formik.values.status === 'Fail' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Báo cáo sẽ bị từ chối và chuyển sang trạng thái "Từ chối"
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={formik.submitForm}
          variant="contained"
          disabled={loading || !formik.isValid}
          color={formik.values.status === 'Pass' ? 'success' : formik.values.status === 'Fail' ? 'error' : 'primary'}
        >
          {loading
            ? 'Đang xử lý...'
            : formik.values.status === 'Pass'
              ? 'Chấp nhận'
              : formik.values.status === 'Fail'
                ? 'Từ chối'
                : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalModal;