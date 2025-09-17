import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import FormOrderAdd from './FormOrderAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { handlerOrderDialog, useGetOrder, useGetOrderMaster } from 'api/order';

// types
import { OrderList } from 'types/order';

const closeModal = () => handlerOrderDialog(false);

// ==============================|| ORDER ADD / EDIT ||============================== //

export default function AddOrder() {
  const { orderMasterLoading, orderMaster } = useGetOrderMaster();
  const { ordersLoading: loading, orders } = useGetOrder();

  const [list, setList] = useState<OrderList | null>(null);

  const isModal = orderMaster?.modal;

  useEffect(() => {
    if (orderMaster?.modal && typeof orderMaster.modal === 'number') {
      const newList = orders.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [orderMaster]);

  const orderForm = useMemo(
    () => !loading && !orderMasterLoading && <FormOrderAdd order={list} closeModal={closeModal} />,
    [list, loading, orderMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
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
            <SimpleBar
              sx={{
                width: 1,
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              {loading && orderMasterLoading ? (
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
