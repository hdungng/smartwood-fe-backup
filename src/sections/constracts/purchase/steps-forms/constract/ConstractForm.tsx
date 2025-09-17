// material-ui
import { Autocomplete, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import React, { useMemo, useRef, useState, forwardRef, useEffect } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// third-party
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';

import GoodsList from './GoodsList';
import axiosServices from 'utils/axios';
import { CONTRACT_API, PURCHASE_CONTRACT_API, PURCHASE_GOOD_API } from 'api/constants';
import AnimateButton from 'components/@extended/AnimateButton';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router';
import { cleanPayload } from 'utils/cleanPayload';
import useCustomer from '../../../../../api/customer';
import { useToast } from '../../../../../contexts';
import { TContract } from 'types/contract';
import { SMARTWOOD_SELECTIONS } from 'constants/smartwood';
// ==============================|| BASIC WIZARD - contracts ||============================== //

// Define the form values interface
interface ContractFormValues {
  code: string;
  contractDate: any;
  sellerName: string;
  buyerName: string;
}

interface TGood {
  id: number;
  goodId: number;
  goodType: string;
  unitPrice: number;
  notes: string;
}

interface ContractionInformation {
  code: string;
  contractDate: string;
  sellerName: string;
  buyerName: string;
}

// Props interface
interface ContractsFormProps {
  initialValues?: any;
  onMoveToNewStep?: () => void;
  detailContract?: any;
  onRefreshData?: () => void;
}

type FormProps = {
  code: string;
  contractDate: string;
  sellerName: string;
  buyerName: string;
};

const LIST_KEY_FIELD_UPDATED = Object.keys({} as FormProps) as (keyof FormProps)[];

const LIST_INFO_SELLER = SMARTWOOD_SELECTIONS;

const ContractsForm = forwardRef(({ initialValues, onMoveToNewStep, detailContract, onRefreshData }: ContractsFormProps, ref) => {
  const intl = useIntl();
  const navigation = useNavigate();
  const toast = useToast();
  const { pathname } = useLocation();
  const isDetailContractExist: boolean = useMemo(() => detailContract && Object.keys(detailContract).length > 0, [detailContract]);
  const isViewScreen: boolean = useMemo(() => pathname.includes('view'), [pathname]);
  const isEditScreen: boolean = useMemo(() => pathname.includes('edit'), [pathname]);

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        code: yup.string().required(intl.formatMessage({ id: 'validate_required_contract_code' })),
        contractDate: yup
          .date()
          .nullable()
          .required(intl.formatMessage({ id: 'validate_required_contractDate_date' })),
        sellerName: yup.string().required(intl.formatMessage({ id: 'validate_required_sellerName_name' })),
        buyerName: yup.string().required(intl.formatMessage({ id: 'validate_required_buyerName_name' }))
      }),
    []
  );

  // // Add state for dialogs
  // const [openSellerDialog, setOpenSellerDialog] = React.useState(false);
  // const [openBuyerDialog, setOpenBuyerDialog] = React.useState(false);
  // const [openSellerBankDialog, setOpenSellerBankDialog] = React.useState(false);
  // const [openBuyerBankDialog, setOpenBuyerBankDialog] = React.useState(false);

  // // Add state for new data
  // const [newSeller, setNewSeller] = React.useState<Partial<SellerInfo>>({});
  // const [newBuyer, setNewBuyer] = React.useState<Partial<BuyerInfo>>({});
  // const [newSellerBank, setNewSellerBank] = React.useState<Partial<BankBeneficiary>>({});
  // const [newBuyerBank, setNewBuyerBank] = React.useState<Partial<BankBeneficiary>>({});

  const formik = useFormik<ContractFormValues>({
    initialValues: {
      code: '',
      contractDate: moment().format('YYYY-MM-DD'),
      sellerName: '',
      buyerName: ''
    },
    validationSchema,
    onSubmit: (values) => {
      if (isViewScreen) {
        onMoveToNewStep && onMoveToNewStep();
        return;
      }
      putListGoods(values);
    }
  });

  useEffect(() => {
    if (isDetailContractExist) {
      LIST_KEY_FIELD_UPDATED.forEach((key) => {
        if (key === 'contractDate') {
          formik.setFieldValue(key, moment(detailContract[key]).format('YYYY-MM-DD'));
        } else {
          formik.setFieldValue(key, detailContract[key]);
        }
      });
    }
  }, [detailContract]);

  const { list: listCustomer } = useCustomer();
  const { customers: buyers = [] } = listCustomer();

  const [contracts, setContracts] = useState<any>();
  const [listContract, setListContract] = useState<TContract[]>();
  const [selectedContract, setSelectedContract] = useState<TContract>();
  const listGoodsRef = useRef<TGood[]>([]);

  useEffect(() => {
    fetchGetListContract();
  }, []);

  const fetchGetListContract = async () => {
    try {
      const { data, status } = await axiosServices.get(CONTRACT_API.GET_LIST);
      if (status === 200 || status === 201) {
        setContracts(data.data.map((item: TContract) => item?.code).filter((item: TContract) => item));
        setListContract(data.data);
      }
    } catch {
      toast.error(intl.formatMessage({ id: 'get_list_of_contract_fail' }));
    }
  };

  const putListGoods = async (values: ContractionInformation) => {
    if (listGoodsRef.current.length === 0) {
      createContractInformation(values);
      return;
    }
    try {
      const response = await Promise.all(
        listGoodsRef.current.map((good) => {
          return axiosServices.put(PURCHASE_GOOD_API.COMMON + `/${good.id}`, {
            purchaseContractId: selectedContract?.purchaseContractId,
            goodId: good.goodId,
            goodType: good.goodType,
            unitPrice: good.unitPrice,
            notes: good.notes
          });
        })
      );
      if (response.every((item) => item.status === 200 || item.status === 201)) {
        toast.success(intl.formatMessage({ id: 'common_update_success_text' }));

        createContractInformation(values);
      }
    } catch {
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    }
  };

  const createContractInformation = async (values: ContractionInformation) => {
    const payload = {
      ...values,
      contractDate: moment(values.contractDate).format(),
      contractId: selectedContract?.id,
      businessPlanId: selectedContract?.businessPlanId
    };

    // Clean payload to remove null values, especially status when it's null
    const cleanedPayload = cleanPayload(payload);
    try {
      const { code, ...rest } = cleanedPayload || {};
      const { status } = await axiosServices.post(
        PURCHASE_CONTRACT_API.CREATE /* + `/${isEditScreen ? detailContract?.id : selectedContract?.purchaseContractId}`, */,
        { ...rest }
      );
      if (status === 201 || status === 200) {
        toast.success(intl.formatMessage({ id: 'common_update_success_text' }));

        onMoveToNewStep && onMoveToNewStep();
        if (isEditScreen) onRefreshData && onRefreshData();
      }
    } catch {
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        {intl.formatMessage({ id: 'contract_information' })}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
            {intl.formatMessage({ id: 'simple_information' })}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'contract_number' })}</InputLabel>
            <Autocomplete
              readOnly={isDetailContractExist && isViewScreen}
              options={contracts}
              value={formik.values.code}
              onChange={(_, value) => {
                formik.setFieldValue('code', value || '');
                const selected_contract = listContract?.find((item) => item.code === value);
                setSelectedContract(selected_contract);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="code"
                  placeholder={intl.formatMessage({ id: 'contract_selected' })}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="contractDate">{intl.formatMessage({ id: 'date_signed_contract' })}</InputLabel>
            {/*<DatePicker*/}
            {/*  enableAccessibleFieldDOMStructure={false}*/}
            {/*  slots={{*/}
            {/*    textField: (params) => (*/}
            {/*      <TextField*/}
            {/*        {...params}*/}
            {/*        fullWidth*/}
            {/*        error={formik.touched.contractDate && Boolean(formik.errors.contractDate)}*/}
            {/*        helperText={formik.touched.contractDate && formik.errors.contractDate}*/}
            {/*      />*/}
            {/*    )*/}
            {/*  }}*/}
            {/*  format="dd/MM/yyyy"*/}
            {/*  name="contractDate"*/}
            {/*  onChange={(value) =>*/}
            {/*    formik.handleChange({*/}
            {/*      target: {*/}
            {/*        name: 'contractDate',*/}
            {/*        value*/}
            {/*      }*/}
            {/*    })*/}
            {/*  }*/}
            {/*  value={formik.values.contractDate}*/}
            {/*/>*/}
          </Stack>
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            {intl.formatMessage({ id: 'buyer_seller_information' })}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'name_seller' })}</InputLabel>
            <Autocomplete
              readOnly={isDetailContractExist && isViewScreen}
              options={LIST_INFO_SELLER}
              value={LIST_INFO_SELLER.find((item) => item.label === formik.values.sellerName) || null}
              onChange={(_, value) => {
                formik.setFieldValue('sellerName', value || '');
                const selected_contract = listContract?.find((item) => item.code === value?.label);
                setSelectedContract(selected_contract);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="sellerName"
                  placeholder={intl.formatMessage({ id: 'enter_seller_name' })}
                  error={formik.touched.sellerName && Boolean(formik.errors.sellerName)}
                  helperText={formik.touched.sellerName && formik.errors.sellerName}
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack spacing={1}>
            <InputLabel>{intl.formatMessage({ id: 'name_buyer' })}</InputLabel>
            <Autocomplete
              readOnly={isDetailContractExist && isViewScreen}
              options={buyers.map((x) => x.name)}
              value={formik.values.buyerName}
              onChange={(_, value) => {
                formik.setFieldValue('buyerName', value || '');
                // const selected_contract = listContract?.find((item) => item.code === value);
                // setSelectedContract(selected_contract);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="buyerName"
                  placeholder={intl.formatMessage({ id: 'enter_buyer_name' })}
                  error={formik.touched.buyerName && Boolean(formik.errors.buyerName)}
                  helperText={formik.touched.buyerName && formik.errors.buyerName}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        {/* Goods Information Section */}
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
            {intl.formatMessage({ id: 'good_information' })}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box sx={{ mb: 2 }}>
            <GoodsList
              // items={formik.values.goodsItems}
              isReadOnly={isViewScreen}
              onItemsChange={(values) => (listGoodsRef.current = values)}
              purchaseContractId={isViewScreen || isEditScreen ? detailContract?.id : selectedContract?.purchaseContractId}
            />
          </Box>
        </Grid>
      </Grid>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Button
          sx={{ my: 3, ml: 1 }}
          onClick={() => {
            navigation(`/contracts/purchase/list`);
          }}
        >
          {intl.formatMessage({ id: 'common_goback' })}
        </Button>
        <AnimateButton>
          <Button type="submit" variant="contained" sx={{ my: 3, ml: 1 }}>
            {intl.formatMessage({ id: 'common_button_continue' })}
          </Button>
        </AnimateButton>
      </Stack>
    </form>
  );
});

export default ContractsForm;
