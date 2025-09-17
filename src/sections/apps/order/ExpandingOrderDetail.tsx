// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// assets
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import { OrderList } from 'types/order';

interface StatusProps {
  value: number;
  label: string;
}

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| EXPANDING TABLE - ORDER DETAILS ||============================== //

export default function ExpandingOrderDetail({ data }: { data: OrderList }) {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const selectedStatus = allStatus.find((item) => item.value === Number(data.status));

  return (
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid size={{ xs: 12, sm: 5, md: 4, xl: 3.5 }}>
        <MainCard>
          <Chip
            label={selectedStatus ? selectedStatus.label : 'Pending'}
            size="small"
            sx={{
              position: 'absolute',
              right: -1,
              top: -1,
              borderRadius: '0 4px 0 4px'
            }}
          />
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
                <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                  <Typography variant="h5">{data.customerName}</Typography>
                  <Typography color="secondary">{data.deliveryMethod}</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Divider />
            </Grid>
            <Grid size={12}>
              <List component="nav" aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItem-root': { p: 0 } }}>
                <ListItem secondaryAction={<Typography sx={{ textAlign: 'right' }}>{data.importCountry}</Typography>}>
                  <ListItemIcon>
                    <EnvironmentOutlined />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Import Country</Typography>} />
                </ListItem>
                <ListItem secondaryAction={<Typography sx={{ textAlign: 'right' }}>{data.deliveryLocation}</Typography>}>
                  <ListItemIcon>
                    <EnvironmentOutlined />
                  </ListItemIcon>
                  <ListItemText primary={<Typography color="secondary">Delivery Location</Typography>} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 7, md: 8, xl: 8.5 }}>
        <Stack spacing={2.5}>
          <MainCard title="Order Details">
            <List sx={{ py: 0 }}>
              <ListItem divider={!downMD}>
                <Grid container spacing={3} sx={{ width: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 0.5 }}>
                      <Typography color="secondary">Product Name</Typography>
                      <Typography>{data.productName}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 0.5 }}>
                      <Typography color="secondary">Payment Method</Typography>
                      <Typography>{data.paymentMethod}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!downMD}>
                <Grid container spacing={3} sx={{ width: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 0.5 }}>
                      <Typography color="secondary">Currency</Typography>
                      <Typography>{data.currency}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 0.5 }}>
                      <Typography color="secondary">Unit Price</Typography>
                      <Typography>${data.unitPrice}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Stack sx={{ gap: 0.5 }}>
                  <Typography color="secondary">Weight</Typography>
                  <Typography>{data.weight} kg</Typography>
                </Stack>
              </ListItem>
            </List>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
