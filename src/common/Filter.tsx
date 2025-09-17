import { FilterOutlined } from '@ant-design/icons';
import { Autocomplete, Box, Button, Checkbox, IconButton, MenuItem, Popover, Stack, TextField, Tooltip, Typography } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

export type FilterField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'autocomplete' | 'autocomplete-multiple';
  options?: { label: string; value: any }[];
  value?: any;
  placeholder?: string;
};

interface FilterProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset?: () => void;
  onApply?: () => void;
}

const Filter: React.FC<FilterProps> = memo(({ fields, values, onChange, onReset, onApply }) => {
  const intl = useIntl();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleReset = useCallback(() => {
    onReset?.();
    handleClose();
  }, [onReset, handleClose]);

  const handleApply = useCallback(() => {
    onApply?.();
    handleClose();
  }, [onApply, handleClose]);

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && onApply) {
        event.preventDefault();
        handleApply();
      }
    },
    [handleApply, onApply]
  );

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={intl.formatMessage({ id: 'filter_label' })}>
        <IconButton color="primary" onClick={handleOpen} size="large">
          <FilterOutlined />
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
            minWidth: { xs: '350px', md: '800px' },
            maxWidth: '90vw'
          }
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          {' '}
          Bộ lọc
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)', // Mặc định (mobile)
                md: 'repeat(3, 1fr)' // Khi màn hình md trở lên
              },
              gap: 2
            }}
          >
            {fields.map((field) => (
              <Box key={field.key}>
                {field.type === 'text' && (
                  <TextField
                    label={field.label}
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={field.placeholder}
                    fullWidth
                    size="medium"
                    sx={{ minWidth: '200px' }}
                  />
                )}
                {field.type === 'autocomplete' && (
                  <Autocomplete
                    value={values[field.key] || ''}
                    onChange={(event, newValue) => onChange(field.key, newValue)}
                    options={field.options || []}
                    renderInput={(params) => <TextField {...params} label={field.label} onKeyDown={handleKeyDown} />}
                    fullWidth
                    size="medium"
                    sx={{ minWidth: '200px' }}
                  />
                )}
                {field.type === 'autocomplete-multiple' && (
                  <Autocomplete
                    multiple
                    value={values[field.key] || []}
                    onChange={(event, newValue) => onChange(field.key, newValue)}
                    options={field.options || []}
                    renderInput={(params) => <TextField {...params} label={field.label} onKeyDown={handleKeyDown} />}
                    fullWidth
                    size="medium"
                    sx={{
                      width: '250px',
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        maxHeight: '100px',
                        overflowY: 'auto'
                      },
                      '& .MuiAutocomplete-tag': {
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: '2px'
                      }
                    }}
                  />
                )}
                {field.type === 'number' && (
                  <TextField
                    label={field.label}
                    type="number"
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={field.placeholder}
                    fullWidth
                    size="medium"
                    sx={{ minWidth: '200px' }}
                  />
                )}
                {field.type === 'select' && (
                  <TextField
                    label={field.label}
                    select
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    size="medium"
                    sx={{ minWidth: '200px' }}
                  >
                    {field.options?.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                {field.type === 'checkbox' && (
                  <Box display="flex" alignItems="center" sx={{ minWidth: '200px' }}>
                    <Checkbox checked={!!values[field.key]} onChange={(e) => onChange(field.key, e.target.checked)} size="medium" />
                    <Typography variant="body2">{field.label}</Typography>
                  </Box>
                )}
                {field.type === 'date' && (
                  <TextField
                    label={field.label}
                    type="date"
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="medium"
                    sx={{ minWidth: '200px' }}
                  />
                )}
              </Box>
            ))}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                {onReset && (
                  <Button onClick={handleReset} variant="outlined" color="primary" size="medium">
                    Đặt lại
                  </Button>
                )}
                {onApply && (
                  <Button onClick={handleApply} variant="contained" size="medium">
                    Áp dụng
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
});

Filter.displayName = 'Filter';

export default Filter;
