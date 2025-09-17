import { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import EmptyUserCard from 'components/cards/skeleton/EmptyUserCard';
import { DebouncedInput } from 'components/third-party/react-table';
import OrderModal from 'sections/apps/order/OrderModal';

import usePagination from 'hooks/usePagination';
import { useGetOrder } from 'api/order';

// types
import { OrderList } from 'types/order';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| ORDER - CARD ||============================== //

const allColumns = [
  {
    id: 1,
    header: 'Default'
  },
  {
    id: 2,
    header: 'Order Name'
  },
  {
    id: 3,
    header: 'Email'
  },
  {
    id: 4,
    header: 'Contact'
  },
  {
    id: 5,
    header: 'Age'
  },
  {
    id: 6,
    header: 'Country'
  },
  {
    id: 7,
    header: 'Status'
  }
];

function dataSort(data: OrderList[], sortBy: string) {
  return data.sort(function (a: any, b: any) {
    if (sortBy === 'Order Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Email') return a.email.localeCompare(b.email);
    if (sortBy === 'Contact') return a.contact.localeCompare(b.contact);
    if (sortBy === 'Age') return b.age < a.age ? 1 : -1;
    if (sortBy === 'Country') return a.country.localeCompare(b.country);
    if (sortBy === 'Status') return a.status.localeCompare(b.status);
    return a;
  });
}

export default function OrderCardPage() {
  const { orders: lists } = useGetOrder();

  const [sortBy, setSortBy] = useState('Default');
  const [globalFilter, setGlobalFilter] = useState('');
  const [orderCard, setOrderCard] = useState<OrderList[]>([]);
  const [page, setPage] = useState(1);
  const [orderLoading, setOrderLoading] = useState<boolean>(true);
  const [orderModal, setOrderModal] = useState<boolean>(false);

  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as string);
  };

  // search
  useEffect(() => {
    setOrderLoading(true);
    if (lists && lists.length > 0) {
      const newData = lists.filter((value: any) => {
        if (globalFilter) {
          return value.name.toLowerCase().includes(globalFilter.toLowerCase());
        } else {
          return value;
        }
      });
      setOrderCard(dataSort(newData, sortBy).reverse());
      setOrderLoading(false);
    }
  }, [globalFilter, lists, sortBy]);

  const PER_PAGE = 6;

  const count = Math.ceil(orderCard.length / PER_PAGE);
  const _DATA = usePagination(orderCard, PER_PAGE);

  const handleChangePage = (e: any, p: any) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <>
      <Box sx={{ position: 'relative', marginBottom: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', width: 1 }}>
          <DebouncedInput
            value={globalFilter ?? ''}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder={`Search ${orderCard.length} records...`}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={handleChange}
                displayEmpty
                slotProps={{ input: { 'aria-label': 'Without label' } }}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography variant="subtitle1">Sort By</Typography>;
                  }

                  return <Typography variant="subtitle2">Sort by ({sortBy})</Typography>;
                }}
              >
                {allColumns.map((column) => {
                  return (
                    <MenuItem key={column.id} value={column.header}>
                      {column.header}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOrderModal(true)}>
              Add Order
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={3}>
        {!orderLoading && orderCard.length > 0 ? (
          _DATA.currentData().map((order: OrderList, index: number) => (
            <Slide key={index} direction="up" in={true} timeout={50}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}></Grid>
            </Slide>
          ))
        ) : (
          <EmptyUserCard title={orderLoading ? 'Loading...' : 'You have not created any order yet.'} />
        )}
      </Grid>
      <Stack spacing={2} sx={{ gap: 2, alignItems: 'flex-end', p: 2.5 }}>
        <Pagination
          sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
          count={count}
          size="medium"
          page={page}
          showFirstButton
          showLastButton
          variant="combined"
          color="primary"
          onChange={handleChangePage}
        />
      </Stack>
      <OrderModal open={orderModal} modalToggler={setOrderModal} />
    </>
  );
}
