import { useBoolean, useDialog, useRouter } from 'hooks';
import { useRole, useToast } from 'contexts';
import { routing } from 'routes/routing';
import { Button } from '@mui/material';
import { useBusinessPlanManageContext } from '../../../../provider';
import { businessPlanService } from 'services/business-plan';
import { BusinessPlanStep } from '../../../../types';
import { useMemo } from 'react';

type Props = {
  saved: boolean;
};

const ButtonRequestApproval = ({ saved }: Props) => {
  const dialog = useDialog();
  const toast = useToast();
  const submitting = useBoolean();
  const { hasPermission } = useRole();
  const router = useRouter();
  const { businessPlan, fieldOnlyView, onRefetchDetail, mode, currentStep } = useBusinessPlanManageContext();

  const canRequestApproval = useMemo(() => saved, [saved]);

  const handleRequestApproval = async () => {
    const result = await dialog.confirm({
      title: 'Yêu cầu phê duyệt',
      description:
        'Bạn có chắc chắn muốn yêu cầu phê duyệt kế hoạch kinh doanh này không? Sau khi yêu cầu, bạn sẽ không thể chỉnh sửa kế hoạch kinh doanh này nữa.',
      label: {
        accept: 'Yêu cầu phê duyệt',
        reject: 'Hủy'
      },
      slotProps: {
        accept: {
          color: 'info'
        }
      }
    });

    if (!result?.success) {
      return;
    }

    try {
      submitting.onTrue();

      const response = await businessPlanService.requestApprovalBusinessPlan(businessPlan!.id);
      if (!response.success) {
        toast.error('Yêu cầu phê duyệt thất bại. Vui lòng thử lại');
        return;
      }

      await onRefetchDetail(businessPlan!.id);

      toast.success('Yêu cầu phê duyệt thành công');

      router.push(hasPermission(['BUSINESS_PLAN_APPROVE']) ? routing.businessPlan.approval : routing.businessPlan.list);
    } finally {
      submitting.onFalse();
    }
  };

  if (fieldOnlyView || !businessPlan || (mode === 'create' && currentStep !== BusinessPlanStep.Cost)) return null;

  return (
    <Button variant="contained" color="info" disabled={!canRequestApproval || submitting.value} onClick={handleRequestApproval}>
      Yêu cầu phê duyệt
    </Button>
  );
};

export default ButtonRequestApproval;
