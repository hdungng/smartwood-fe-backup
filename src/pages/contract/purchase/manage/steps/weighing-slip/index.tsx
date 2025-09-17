import { ActualTowingSection, ButtonSave, SummarySection, WeightSummarySection } from './components';
import Stack from '@mui/material/Stack';
import { StepAction, StepActionHandler } from 'components/@extended/Steps';
import Divider from '@mui/material/Divider';
import { Form, useFormResolver } from 'forms';
import { WeighingSlipFormProps, weighingSlipSchema } from '../../schema';
import {
  purchaseContractService,
  CreateContractPurchaseWeightTicketRequest,
  GetDetailPurchaseContractWeightTicketResponse
} from 'services/contract';
import { useGlobal, useToast } from 'contexts';
import { useContractPurchaseManageContext } from '../../providers';
import { dateHelper, formatPatterns } from 'utils';
import { useBoolean, useConfiguration, useRouter } from 'hooks';
import { routing } from 'routes/routing';
import React, { startTransition, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { CODE_QUALITY_TYPE } from '../../../../../../constants/code';
import { SelectionOption } from 'types/common';
import { CodeBookingMetaData } from '../../types';

type Props = StepActionHandler;

const WeighingSlipStep = ({ onBack }: Props) => {
  const toast = useToast();
  const router = useRouter();
  const { mode, purchaseContract, codeBookingOptions } = useContractPurchaseManageContext();
  const [weighingTicketDetail, setWeighingTicketDetail] = useState<GetDetailPurchaseContractWeightTicketResponse | undefined>(undefined);
  const { mapConfigSelection } = useConfiguration();
  const { shippingUnitOptions, goodOptions, supplierOptions } = useGlobal();

  const initializing = useBoolean(true);

  const form = useFormResolver<WeighingSlipFormProps>(weighingSlipSchema, {
    defaultValues: {
      actualTowing: []
    }
  });

  const { reset, getValues } = form;

  useEffect(() => {
    (async () => {
      if (mode === 'create' || !purchaseContract?.id) {
        return;
      }

      const response = await purchaseContractService.getDetailContractPurchaseWeightTicket(purchaseContract.id);
      const details = response.data || [];
      if (details?.length > 0) {
        setWeighingTicketDetail(details[0]);
      } else {
        initializing.onFalse();
      }
    })();
  }, [mode, purchaseContract]);

  useEffect(() => {
    if (mode === 'create' || !weighingTicketDetail) {
      return;
    }

    initializing.onTrue();

    const goodTypeOptions = mapConfigSelection(CODE_QUALITY_TYPE);

    const details = (weighingTicketDetail.purchaseContractWeightTicketDetails || []).map((ticket) => {
      let good = (goodOptions.find((x) => x.value === ticket.goodId) || null) as SelectionOption;

      good = {
        ...good,
        metadata: {
          defaultSupplier: ticket.supplierId,
          defaultGoodType: ticket.goodType
        }
      };

      return {
        codeBooking:
          codeBookingOptions.find((x) => x.value === ticket.shippingScheduleId) || (null as SelectionOption<CodeBookingMetaData> | null),
        region: ticket.region,
        good,
        goodType: goodTypeOptions.find((x) => x.value === ticket.goodType) || null,
        loadingDate: dateHelper.from(ticket.loadingDate),
        supplier: supplierOptions.find((x) => x.value === ticket.supplierId) || null,
        actualWeight: ticket.weight || 0,
        goodPrice: ticket.unitPrice || 0,
        delivery: shippingUnitOptions.find((x) => x.value === ticket.transportUnit) || null,
        transportPrice: ticket.unitPriceTransport || 0,
        unloadingPort: ticket.unloadingPort || '',
        truckNumber: ticket.truckNumber || '',
        containerNumber: ticket.containerNumber || '',
        sealNumber: ticket.sealNumber || '',
        coverageGoodType: (goodTypeOptions.find((x) => x.value === ticket.coverageType)?.value || '') as string,
        coverageQuantity: ticket.coverageQuantity,
        initialized: true,
        saved: true
      };
    });

    startTransition(() => {
      reset({
        actualTowing: details as Dynamic
      });
    });

    setTimeout(() => {
      initializing.onFalse();
    }, 200);
  }, [weighingTicketDetail, mode]);

  const handleSubmit = async (values: WeighingSlipFormProps, event: Dynamic) => {
    if (mode === 'view') {
      router.push(routing.contractPurchase.list);
      return;
    }

    if (!purchaseContract?.id) {
      toast.error('Không tìm thấy hợp đồng mua hàng. Vui lòng thử lại sau.');
      return;
    }

    const { actualTowing } = values;

    const payload: CreateContractPurchaseWeightTicketRequest = {
      purchaseContractId: purchaseContract!.id,
      purchaseContractWeightTicketDetails: actualTowing.map((item) => ({
        shippingScheduleId: item.codeBooking.value as number,
        region: item.region,
        goodId: item.good.value as number,
        supplierId: item.supplier?.value as number,
        transportUnit: `${item.delivery.value}`,
        goodType: `${item.goodType.value}`,
        loadingDate: dateHelper.formatDate(item.loadingDate, formatPatterns.iso.date),
        weight: item.actualWeight,
        unitPrice: item.goodPrice,
        containerNumber: item.containerNumber,
        sealNumber: item.sealNumber,
        truckNumber: item.truckNumber,
        unloadingPort: item.unloadingPort,
        unitPriceTransport: item.transportPrice,
        coverageQuantity: item.coverageQuantity || (undefined as number | undefined),
        coverageType: item.coverageGoodType as string | undefined
      }))
    };

    const response = await purchaseContractService.createContractPurchaseWeightTicket(payload);

    if (!response.success) {
      toast.error('Xảy ra lỗi khi tạo phiếu cân hàng. Vui lòng thử lại sau.');
      return;
    }

    toast.success('Lưu phiếu cân hàng thành công.');

    const canExit = event?.nativeEvent?.submitter?.value === 'btn-save-continue';
    if (canExit) {
      router.push(routing.contractPurchase.list);
    }

    reset({
      actualTowing: getValues('actualTowing').map((item, index) => ({
        ...item,
        saved: true
      }))
    });
  };

  return (
    <Form methods={form} onSubmit={handleSubmit}>
      <Stack spacing={3} divider={<Divider />}>
        {initializing.value ? (
          <Stack direction="row" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <ActualTowingSection detail={weighingTicketDetail} />

            <WeightSummarySection />

            <SummarySection />
          </>
        )}

        <StepAction
          onBack={onBack}
          slotProps={{
            back: { disabled: initializing.value }
          }}
          slots={{
            next: (
              <>
                {mode === 'view' ? (
                  <Button variant="contained" color="primary" onClick={() => router.push(routing.contractPurchase.list)}>
                    Hoàn Thành
                  </Button>
                ) : (
                  <Stack direction="row" justifyContent="end" spacing={2}>
                    <ButtonSave id="btn-save" label="Lưu" disabled={initializing.value} />

                    <ButtonSave id="btn-save-continue" label="Lưu & Thoát" disabled={initializing.value} />
                  </Stack>
                )}
              </>
            )
          }}
        />
      </Stack>
    </Form>
  );
};
export default WeighingSlipStep;
