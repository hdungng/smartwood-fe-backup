import React, { useRef } from 'react';

import { Chip, Typography, Stack } from '@mui/material';

import { useRegion } from 'contexts';
import { useBoolean } from 'hooks';
import Popper from '@mui/material/Popper';
import Transitions from 'components/@extended/Transitions';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { alpha } from '@mui/material/styles';

const RoleIndicator = () => {
  const { currentRegion, availableRegions, onChangeCurrentRegion } = useRegion();
  const anchorRef = useRef<any>(null);
  const open = useBoolean();

  if (!currentRegion) return null;

  console.log('availableRegions', availableRegions, availableRegions.length > 1);

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} minWidth={150}>
        <Typography variant="caption" color="text.secondary">
          Khu vực:
        </Typography>
        <Chip
          label={currentRegion?.label}
          color="primary"
          variant="outlined"
          size="small"
          ref={anchorRef}
          sx={{
            cursor: 'text',
            ...(availableRegions.length > 1 && { cursor: 'pointer' })
          }}
          onClick={() => {
            if (availableRegions.length > 1) {
              open.onTrue();
            }
          }}
        />
      </Stack>

      {availableRegions.length > 1 && (
        <Popper
          open={open.value}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 9]
                }
              }
            ]
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position="top-right" in={open.value} {...TransitionProps}>
              <Paper sx={(theme) => ({ minWidth: 160 })}>
                <ClickAwayListener onClickAway={() => open.onFalse()}>
                  <Stack p={1} spacing={0.5}>
                    {availableRegions.map((region) => (
                      <Typography
                        key={region.value}
                        variant="body2"
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                          '&:hover': { backgroundColor: 'action.hover' },
                          ...(region.value === currentRegion.value && {
                            fontWeight: 'bold',
                            color: 'primary.main',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                          })
                        }}
                        onClick={() => onChangeCurrentRegion(region)}
                      >
                        {region.label}
                      </Typography>
                    ))}
                  </Stack>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      )}
    </>
  );
};

export default React.memo(RoleIndicator);
