import { useMemo } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import FormOrderAdd from './FormOrderAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { useGetOrder } from 'api/order';

// types
import { OrderList } from 'types/order';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  order?: OrderList | null;
}

// ==============================|| ORDER ADD / EDIT ||============================== //

export default function OrderModal({ open, modalToggler, order }: Props) {
  const { ordersLoading: loading } = useGetOrder();

  const closeModal = () => modalToggler(false);

  const orderForm = useMemo(
    () => !loading && <FormOrderAdd order={order || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [order, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-order-add-label"
          aria-describedby="modal-order-add-description"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            sx={{ minWidth: { xs: 320, sm: 600, md: 768 }, maxWidth: 768, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar sx={{ maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center' }}>
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                orderForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
