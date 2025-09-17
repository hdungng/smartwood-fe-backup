import * as Yup from 'yup';
import { IntlShape } from 'react-intl';

export const getGoodValidationSchema = (intl: IntlShape) =>
  Yup.object().shape({
    contractDetailsRows: Yup.array().of(
      Yup.object().shape({
        goodId: Yup.number().required(intl.formatMessage({ id: 'validation.goodId.required' })),
        goodDescription: Yup.string().required(intl.formatMessage({ id: 'validation.goodDescription.required' })),
        deliveryPort: Yup.string().required(intl.formatMessage({ id: 'validation.deliveryPort.required' })),
        receivingPort: Yup.string().required(intl.formatMessage({ id: 'validation.receivingPort.required' })),
        // unit, unitPrice, currency are readonly fields from businessPlanDetail, so no validation needed
        unit: Yup.string(),
        unitPrice: Yup.number(),
        currency: Yup.string(),
        totalWeight: Yup.number()
          .min(0, intl.formatMessage({ id: 'validation.totalWeight.min' }))
          .required(intl.formatMessage({ id: 'validation.totalWeight.required' })),
        totalQuantity: Yup.number()
          .min(0, intl.formatMessage({ id: 'validation.totalQuantity.min' }))
          .required(intl.formatMessage({ id: 'validation.totalQuantity.required' }))
      })
    )
  });
