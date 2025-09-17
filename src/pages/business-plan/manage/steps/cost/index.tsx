import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Form, useFormResolver } from 'forms';
import { CostFormProps, costSchema } from '../../schema';
import { useBusinessPlanManageContext } from '../../provider';
import React, { useEffect, useState } from 'react';
import {
  BusinessPlanCostExtendData,
  BusinessPlanCostSection,
  businessPlanService,
  ItemCode,
  UpdateBusinessPlanCostItem
} from 'services/business-plan';
import { useRole, useToast } from 'contexts';
import { ButtonBack, ButtonSave, CostSection, CostTableContainer, SummaryAnalysisSection, OtherCostContainer } from './components';
import { CostKeySection } from '../../types';
import { StepAction, StepActionHandler } from 'components/@extended/Steps';
import { useBoolean, useRouter } from 'hooks';
import { routing } from 'routes/routing';
import CircularProgress from '@mui/material/CircularProgress';
import { buttonActionId } from 'constants/component';
import { CustomButton } from 'components/buttons';

type Props = StepActionHandler;

const CostStep = ({ onBack }: Props) => {
  const { fieldOnlyView, businessPlan } = useBusinessPlanManageContext();
  const toast = useToast();
  const { hasPermission } = useRole();
  const router = useRouter();
  const initializing = useBoolean(true);
  const form = useFormResolver<CostFormProps>(costSchema);
  const [costExtendData, setCostExtendData] = useState<BusinessPlanCostExtendData>();

  useEffect(() => {
    (async () => {
      try {
        if (!businessPlan?.id) return;

        const transformItemHandler = (section: BusinessPlanCostSection) => ({
          name: section.name,
          items: section.items.map((item) => ({
            ...item,
            percentage: item.isPercentage ? item.amount : 0
          }))
        });

        const response = await businessPlanService.getBusinessPlanCost(businessPlan.id);
        const costs = response?.data || [];
        if (costs.length > 0) {
          const firstCost = costs[0];
          setCostExtendData(firstCost.extendData);
          form.reset({
            ...form.getValues(),
            logistics: transformItemHandler(costs[0].logistics),
            customs: transformItemHandler(costs[0].customs),
            finance: transformItemHandler(costs[0].finance),
            management: transformItemHandler(costs[0].management),
            other: transformItemHandler(costs[0].other)
          });
        }
      } finally {
        initializing.onFalse();
      }
    })();
  }, [businessPlan]);

  const handleNavigateAfterSubmit = () => {
    const path = hasPermission(['BUSINESS_PLAN_APPROVE']) ? routing.businessPlan.approval : routing.po.list;

    router.push(path);
  };

  const handleRequestApproval = async () => {
    const response = await businessPlanService.requestApprovalBusinessPlan(businessPlan!.id);
    if (!response.success) {
      toast.error('Yêu cầu phê duyệt thất bại. Vui lòng thử lại');
      return;
    }

    toast.success('Yêu cầu phê duyệt thành công');

    router.push(hasPermission(['BUSINESS_PLAN_APPROVE']) ? routing.businessPlan.approval : routing.businessPlan.list);
  };

  const handleSubmit = async (values: CostFormProps, event: Dynamic) => {
    if (!businessPlan?.id) return;

    const payload = Object.keys(values).reduce((acc: Dynamic, key: string) => {
      const keySection = key as CostKeySection;
      const section = values[keySection];

      if (section && Array.isArray(section.items) && section.items.length > 0) {
        const items: UpdateBusinessPlanCostItem[] = section.items.map((item) => ({
          itemCode: item.itemCode as ItemCode,
          amount: item.percentage ? item.percentage : Number(item.amount),
          ...(keySection === 'other' && {
            unit: item.unit,
            notes: item.notes
          })
        }));

        acc[key as CostKeySection] = items;
      }
      return acc;
    }, {});

    const response = await businessPlanService.updateBusinessPlanCost({
      businessPlanId: businessPlan!.id,
      ...payload
    });

    if (!response.success) {
      toast.error('Cập nhật chi phí thất bại');
      return;
    }

    const canRequestApproval = event?.nativeEvent?.submitter?.value === buttonActionId.SaveAndRequestApproval;
    if (canRequestApproval) {
      await handleRequestApproval();
      return;
    }

    form.reset(
      {
        ...form.getValues()
      },
      {
        keepDirty: false,
        keepErrors: false,
        keepTouched: false,
        keepValues: true
      }
    );

    toast.success('Cập nhật chi phí thành công');
  };

  const renderListCostSections = () => {
    const sections = Object.keys(form.getValues()) as CostKeySection[];

    return sections.map((section: CostKeySection) => (
      <CostSection key={section} title={form.getValues()[section].name}>
        {section === 'other' ? <OtherCostContainer /> : <CostTableContainer sectionKey={section} costExtendData={costExtendData} />}
      </CostSection>
    ));
  };

  return (
    <Form methods={form} onSubmit={handleSubmit}>
      {initializing.value ? (
        <Stack justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <SummaryAnalysisSection />

          <Typography variant="h5" my={2}>
            Chi phí
          </Typography>

          <Stack divider={<Divider />}>{renderListCostSections()}</Stack>
        </>
      )}

      <StepAction
        onBack={onBack}
        slots={{
          back: <ButtonBack onBack={onBack} />,
          next: (
            <>
              {fieldOnlyView ? (
                <CustomButton variant="contained" color="primary" onClick={handleNavigateAfterSubmit} onEnter={handleNavigateAfterSubmit}>
                  Thoát
                </CustomButton>
              ) : (
                <Stack direction="row" justifyContent="end" spacing={1}>
                  <ButtonSave id={buttonActionId.Save} label="Lưu" />

                  <ButtonSave id={buttonActionId.SaveAndRequestApproval} label="Lưu & Yêu cầu phê duyệt" />

                  <CustomButton variant="contained" color="primary" onClick={handleNavigateAfterSubmit} onEnter={handleNavigateAfterSubmit}>
                    Thoát
                  </CustomButton>
                </Stack>
              )}
            </>
          )
        }}
      />
    </Form>
  );
};

export default CostStep;
