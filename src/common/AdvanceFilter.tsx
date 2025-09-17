import React, { useState, useCallback, memo } from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Popover,
  Typography,
  Grid,
  Tooltip
} from '@mui/material';
import { PlusOutlined, DeleteOutlined, UngroupOutlined } from '@ant-design/icons';
import { OPERATORS } from 'constants/operator';

export type FilterField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'autocomplete' | 'autocomplete-multiple';
  options?: { label: string; value: any }[];
  value?: any;
  placeholder?: string;
};

export type FilterCondition = {
  field: string;
  operator: string;
  value: string;
};

interface AdvancedFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: FilterCondition[]) => void;
  onApply?: () => void;
  onReset?: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = memo(({ fields, onFilterChange, onApply, onReset }) => {
  const [filters, setFilters] = useState<FilterCondition[]>(() => [{ field: '', operator: 'contains', value: '' }]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);

  const handleAddFilter = useCallback(() => {
    setFilters((prev) => [...prev, { field: '', operator: 'contains', value: '' }]);
  }, []);

  const handleRemoveFilter = useCallback(
    (index: number) => {
      setFilters((prev) => {
        const newFilters = prev.filter((_, i) => i !== index);

        // Only send valid filters to parent
        const validFilters = newFilters.filter(
          (filter) => filter.field && filter.field.trim() !== '' && filter.value && String(filter.value).trim() !== ''
        );

        onFilterChange(validFilters);
        return newFilters;
      });
    },
    [onFilterChange]
  );

  const handleFilterChange = useCallback(
    (index: number, key: keyof FilterCondition, value: string) => {
      setFilters((prev) => {
        const newFilters = prev.map((filter, i) => (i === index ? { ...filter, [key]: value } : filter));

        // Only send valid filters to parent (filters with both field and value)
        const validFilters = newFilters.filter(
          (filter) => filter.field && filter.field.trim() !== '' && filter.value && String(filter.value).trim() !== ''
        );

        onFilterChange(validFilters);
        return newFilters;
      });
    },
    [onFilterChange]
  );

  const handleReset = useCallback(() => {
    const initialFilters = [{ field: '', operator: 'contains', value: '' }];
    setFilters(initialFilters);
    onFilterChange([]);
    onReset?.();
    handleClose();
  }, [onFilterChange, onReset, handleClose]);

  const handleApply = useCallback(() => {
    onApply?.();
    handleClose();
  }, [onApply, handleClose]);

  return (
    <>
      <Tooltip title="Advanced Filter">
        <IconButton color="primary" onClick={handleOpen} size="large">
          <UngroupOutlined />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            width: '800px'
          }
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Advanced Filter
        </Typography>
        <Box sx={{ width: '100%' }}>
          <Stack spacing={2}>
            {filters.map((filter, index) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid size={{ xs: 12, sm: 3, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Field</InputLabel>
                    <Select value={filter.field} label="Field" onChange={(e) => handleFilterChange(index, 'field', e.target.value)}>
                      {fields.map((field) => (
                        <MenuItem key={field.key} value={field.key}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={filter.operator}
                      label="Condition"
                      onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                    >
                      {OPERATORS.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 5 }}>
                  <TextField
                    label="Value"
                    value={filter.value}
                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2, md: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton onClick={() => handleRemoveFilter(index)} color="error" disabled={filters.length === 1}>
                    <DeleteOutlined />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Button startIcon={<PlusOutlined />} onClick={handleAddFilter} variant="outlined" fullWidth>
                  Add Filter
                </Button>
              </Grid>

              <Grid sx={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  {onReset && (
                    <Button onClick={handleReset} color="inherit" fullWidth>
                      Đặt lại
                    </Button>
                  )}
                  {onApply && (
                    <Button onClick={handleApply} variant="contained" fullWidth>
                      Áp dụng
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Popover>
    </>
  );
});

AdvancedFilter.displayName = 'AdvancedFilter';

export default AdvancedFilter;
