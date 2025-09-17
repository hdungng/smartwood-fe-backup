import { CustomDialog } from 'components/@extended/dialog';
import { DialogRequest, useToast } from 'contexts';
import { Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import { CommonStatus, dateHelper, getStatusColor, getStatusText, numberHelper, unitHelper } from 'utils';
import { CODE_QUALITY_TYPE, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useEffect, useMemo, useState } from 'react';
import { PurchaseContractDetailResponse, purchaseContractService } from 'services/contract';
import { useBoolean, useConfiguration } from 'hooks';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { BusinessPlan, businessPlanService } from 'services/business-plan';
import { SummaryItem } from './components';
import { useIntl } from 'react-intl';

type Props = DialogRequest & {
  purchaseContractId: number;
  businessPlanId: number;
};

const ContractPurchaseApprovalDialog = ({ purchaseContractId, businessPlanId, ...otherProps }: Props) => {
  const { mapConfigObject } = useConfiguration();
  const submitting = useBoolean();
  const toast = useToast();
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [purchaseContract, setPurchaseContract] = useState<PurchaseContractDetailResponse | null>(null);
  const [reason, setReason] = useState<string>('');
  const intl = useIntl();

  const handleFetchDetailBusinessPlan = async () => {
    const response = await businessPlanService.getDetailBusinessPlan(businessPlanId);
    if (response.data) {
      setBusinessPlan(response.data);
    }
  };

  const handleFetchDetailPurchaseContract = async () => {
    const response = await purchaseContractService.getDetailPurchaseContract(purchaseContractId);
    if (response.data) {
      setPurchaseContract(response.data);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([handleFetchDetailBusinessPlan(), handleFetchDetailPurchaseContract()]);
    })();
  }, []);

  const poTotalCost = useMemo(() => {
    const totalCostByKg = (purchaseContract?.purchaseContractPackingPlan?.purchaseContractPackingPlanGoodSuppliers || []).reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
    return unitHelper.fromKgToTon(totalCostByKg);
  }, [purchaseContract]);

  const poTotalQuantity = useMemo(() => {
    const totalQuantityByKg = (purchaseContract?.purchaseContractPackingPlan?.purchaseContractPackingPlanGoodSuppliers || [])
      .reduce((total, item) => total + item.quantity, 0);

    return unitHelper.fromKgToTon(totalQuantityByKg);
  }, [purchaseContract]);

  const businessPlanTotalCost = useMemo(
    () => (businessPlan?.businessPlanSupplierItems || []).reduce((total: number, item: Dynamic) => total + item.totalAmount, 0),
    [businessPlan]
  );

  const businessPlanTotalQuantity = useMemo(
    () => (businessPlan?.businessPlanSupplierItems || []).reduce((total: number, item: Dynamic) => total + item.quantity, 0),
    [businessPlan]
  );

  const businessFactorWeight = useMemo(() => {
    if (!businessPlan?.draftPo?.unitOfMeasure) return 1;

    return businessPlan?.draftPo?.unitOfMeasure === 'TON' ? 1 : 1000;
  }, [businessPlan?.draftPo?.unitOfMeasure]);

  const handleReject = async () => {
    if (!purchaseContract) return;

    try {
      submitting.onTrue();

      const response = await purchaseContractService.rejectContractPurchase({
        id: purchaseContract.id,
        note: reason
      });

      if (!response?.success) {
        toast.error('Từ chối hợp đồng mua thất bại. Vui lòng thử lại.');
        return;
      }

      toast.success('Từ chối hợp đồng mua thành công.');
      otherProps.onClose({
        success: true
      });
    } finally {
      submitting.onFalse();
    }
  };

  const handleApprove = async () => {
    if (!purchaseContract) return;

    try {
      submitting.onTrue();

      const response = await purchaseContractService.approvalContractPurchase({
        id: purchaseContract.id,
        note: reason
      });
      if (!response?.success) {
        toast.error('Phê duyệt hợp đồng mua thất bại. Vui lòng thử lại.');
        return;
      }

      toast.success('Phê duyệt hợp đồng mua thành công.');
      otherProps.onClose({
        success: true
      });
    } finally {
      submitting.onFalse();
    }
  };

  return (
    <CustomDialog
      {...otherProps}
      title={`Chi tiết đơn hàng mua ${purchaseContract?.code ? `- ${purchaseContract.code}` : ''}`}
      maxWidth="lg"
      action={
        <Stack direction="row" spacing={1}>
          <Button onClick={() => otherProps.onClose()} variant="outlined" color="inherit" startIcon={<CloseCircleOutlined />}>
            Đóng
          </Button>
          {(purchaseContract?.status === CommonStatus.RequestApproval || purchaseContract?.status === CommonStatus.Rejected) && (
            <>
              <Button onClick={handleReject} variant="outlined" color="error" startIcon={<CloseCircleOutlined />} sx={{ minWidth: 120 }}>
                {purchaseContract.status === CommonStatus.Rejected ? 'Từ Chối Lại' : 'Từ Chối'}
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlined />}
                sx={{ minWidth: 120 }}
              >
                {purchaseContract.status === CommonStatus.Rejected ? 'Phê Duyệt Lại' : 'Phê Duyệt'}
              </Button>
            </>
          )}
        </Stack>
      }
      slotProps={{
        action: {
          sx: {
            gap: 1
          }
        }
      }}
    >
      {purchaseContract ? (
        <Stack spacing={3}>
          {/* Basic Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin cơ bản
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã PO
                  </Typography>
                  <Typography variant="h6">{purchaseContract.code}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số hợp đồng
                  </Typography>
                  <Typography variant="h6">{purchaseContract.contractNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày hợp đồng
                  </Typography>
                  <Typography variant="h6">{dateHelper.formatDate(purchaseContract.contractDate)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bên mua
                  </Typography>
                  <Typography variant="h6">{purchaseContract.buyerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Typography variant="h6">
                    <Chip label={getStatusText(purchaseContract.status)} color={getStatusColor(purchaseContract.status)} size="small" />
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Packing Plan Information */}
          {purchaseContract.purchaseContractPackingPlan && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  📦 Thông tin kế hoạch đóng gói
                </Typography>
                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mã kế hoạch
                    </Typography>
                    <Typography variant="body1">{purchaseContract.purchaseContractPackingPlan.code || '---'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={getStatusText(purchaseContract.purchaseContractPackingPlan.status)}
                        color={getStatusColor(purchaseContract.purchaseContractPackingPlan.status)}
                        size="small"
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Đã phê duyệt
                    </Typography>
                    <Typography variant="body1">{purchaseContract.purchaseContractPackingPlan.isApprove ? 'Có' : 'Chưa'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID lịch vận chuyển
                    </Typography>
                    <Typography variant="body1">{purchaseContract.purchaseContractPackingPlan.shippingScheduleId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">{dateHelper.formatDate(purchaseContract.purchaseContractPackingPlan.createdAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật lần cuối
                    </Typography>
                    <Typography variant="body1">
                      {dateHelper.formatDate(purchaseContract.purchaseContractPackingPlan.lastUpdatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Goods Information */}
          {purchaseContract.purchaseContractPackingPlan?.purchaseContractPackingPlanGoodSuppliers &&
            purchaseContract.purchaseContractPackingPlan.purchaseContractPackingPlanGoodSuppliers.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🏭 Thông tin hàng hóa
                  </Typography>
                  {purchaseContract.purchaseContractPackingPlan.purchaseContractPackingPlanGoodSuppliers.map((item, index) => (
                    <Card key={item.id} sx={{ mb: 2, backgroundColor: 'grey.50' }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Hàng hóa #{index + 1}
                        </Typography>
                        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Mã hàng hóa
                            </Typography>
                            <Typography variant="body1">{item.code}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Loại hàng
                            </Typography>
                            <Typography variant="body1">{mapConfigObject(CODE_QUALITY_TYPE, item.goodType)}</Typography>
                          </Box>

                          <Box />

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Số lượng
                            </Typography>
                            <Typography variant="body1">{numberHelper.formatNumber(item.quantity)} Kg</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Đơn giá
                            </Typography>
                            <Typography variant="body1">{numberHelper.formatNumber(item.unitPrice)} VND</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Thành tiền
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {numberHelper.formatNumber(item.quantity * item.unitPrice)} VND
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                📊 Tổng kết tài chính
              </Typography>

              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Phương án kinh doanh
                  </Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                    <SummaryItem title="Số lượng hàng hóa" value={businessPlan?.businessPlanSupplierItems?.length || 0} color="info" />
                    <SummaryItem
                      title="Tổng khối lượng"
                      value={`${numberHelper.formatNumber(businessPlanTotalQuantity / businessFactorWeight)} Tấn`}
                      color="warning"
                    />
                    <SummaryItem
                      title="Tổng giá trị hợp đồng"
                      value={`${numberHelper.formatNumber(businessPlanTotalCost / businessFactorWeight)} VND`}
                      color="success"
                    />
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Đơn hàng mua
                  </Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                    <SummaryItem
                      title="Số lượng hàng hóa"
                      value={purchaseContract.purchaseContractPackingPlan?.purchaseContractPackingPlanGoodSuppliers?.length || 0}
                      color="info"
                    />
                    <SummaryItem
                      title="Tổng khối lượng"
                      value={`${numberHelper.formatNumber(poTotalQuantity)} ${intl.formatMessage({ id: 'unit_ton' })}`}
                      color="warning"
                    />
                    <SummaryItem title="Tổng giá trị hợp đồng" value={`${numberHelper.formatNumber(poTotalCost)} VND`} color="success" />
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Approval Comments */}
          <Card sx={{ backgroundColor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Ghi chú phê duyệt
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Nhập ghi chú của bạn về yêu cầu phê duyệt này..."
                variant="outlined"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ backgroundColor: 'white' }}
              />
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Stack spacing={2} alignItems="center" justifyContent="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            Đang tải thông tin đơn hàng mua...
          </Typography>
        </Stack>
      )}
    </CustomDialog>
  );
};

export default ContractPurchaseApprovalDialog;
