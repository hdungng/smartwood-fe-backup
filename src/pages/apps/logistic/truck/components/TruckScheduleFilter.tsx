import React from 'react';
import { Grid, InputLabel, Stack, Tooltip, IconButton } from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import { Input } from 'components/@extended/input';
import { SelectionOption } from '../hooks/useTruckScheduleLogic';

interface TruckScheduleFilterProps {
  bookingOptions: SelectionOption[];
  selectedBooking: SelectionOption | null;
  setSelectedBooking: (booking: SelectionOption | null) => void;
}

export const TruckScheduleFilter: React.FC<TruckScheduleFilterProps> = ({
  bookingOptions,
  selectedBooking,
  setSelectedBooking
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <Stack sx={{ gap: 1 }}>
          <InputLabel sx={{ fontWeight: 'bold', color: '#333' }}>
            Lọc theo số booking
          </InputLabel>
          <Stack direction="row" spacing={1} alignItems="center">
            <Input.Autocomplete
              size="medium"
              fullWidth
              options={bookingOptions}
              value={selectedBooking}
              onChange={(newValue: any) => setSelectedBooking(newValue)}
              getOptionLabel={(option: any) => option.label}
              isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
              placeholder="Chọn số booking để lọc"
            />
            <Tooltip title="Xóa bộ lọc">
              <IconButton
                size="medium"
                tabIndex={11}
                onClick={() => setSelectedBooking(null)}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  '&:hover': { 
                    backgroundColor: '#ffebee',
                    color: '#d32f2f',
                    borderColor: '#d32f2f'
                  }
                }}
              >
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
