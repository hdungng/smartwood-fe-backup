import { Checkbox, TableRow, Typography } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useCallback, useMemo, memo } from 'react';
import { ScreenPermission, Screen } from 'services/authority';
import { useBoolean } from 'hooks';
import { SCREEN_PERMISSIONS_DISABLED, ROLES_DISABLED, PERMISSIONS, getScreenDisplayName } from '../../../../../../constants/authority';

const PermissionCheckbox = memo(({ 
  screen, 
  permission, 
  disabled 
}: { 
  screen: Screen; 
  permission: string; 
  disabled: boolean; 
}) => {
  const { control } = useFormContext();
  
  return (
    <Controller
      name={`permissions.${screen}.${permission}`}
      control={control}
      disabled={disabled}
      render={({ field: { value, ref, ...otherField } }) => (
        <Checkbox
          {...otherField}
          slotProps={{
            input: {
              ref
            }
          }}
          checked={value || false}
          size="small"
        />
      )}
    />
  );
});

type Props = {
  groupName: string;
  screens: Screen[];
  roleCode?: string;
};

const GroupPermission = ({ groupName, roleCode, screens }: Props) => {
  const { control, setValue } = useFormContext();
  const collapse = useBoolean(true);
  
  const watchedPermissions = useWatch({ 
    control, 
    name: 'permissions' 
  });

  const hasPermissionDisabled = useCallback(
    (permission: ScreenPermission) => {
      if (!roleCode) return false;

      return SCREEN_PERMISSIONS_DISABLED.includes(permission) && ROLES_DISABLED.includes(roleCode);
    },
    [roleCode]
  );

  const permissionStates = useMemo(() => {
    if (!watchedPermissions) {
      return PERMISSIONS.reduce((acc, permission) => {
        acc[permission] = { allSelected: false, indeterminate: false };
        return acc;
      }, {} as Record<string, { allSelected: boolean; indeterminate: boolean }>);
    }

    return PERMISSIONS.reduce((acc, permission) => {
      let totalScreens = 0;
      let selectedScreens = 0;

      screens.forEach(screen => {
        const isDisabled = hasPermissionDisabled(`${screen}_${permission}` as ScreenPermission);
        if (!isDisabled) {
          totalScreens++;
          if (watchedPermissions[screen]?.[permission]) {
            selectedScreens++;
          }
        }
      });

      const allSelected = totalScreens > 0 && selectedScreens === totalScreens;
      const indeterminate = selectedScreens > 0 && selectedScreens < totalScreens;

      acc[permission] = { allSelected, indeterminate };
      return acc;
    }, {} as Record<string, { allSelected: boolean; indeterminate: boolean }>);
  }, [watchedPermissions, screens, hasPermissionDisabled]);

  const handleSelectAllForPermission = useCallback((permission: string, checked: boolean) => {
    screens.forEach(screen => {
      const isDisabled = hasPermissionDisabled(`${screen}_${permission}` as ScreenPermission);
      if (!isDisabled) {
        setValue(`permissions.${screen}.${permission}`, checked, { shouldDirty: true });
      }
    });
  }, [screens, hasPermissionDisabled, setValue]);

  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }}>
        <TableCell
          onClick={collapse.onToggle}
          sx={{
            backgroundColor: 'action.hover',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          {groupName}
        </TableCell>
        {PERMISSIONS.map((permission) => (
          <TableCell
            key={permission}
            sx={{
              backgroundColor: 'action.hover',
              textAlign: 'center'
            }}
          >
            <Checkbox
              checked={permissionStates[permission].allSelected}
              indeterminate={permissionStates[permission].indeterminate}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectAllForPermission(permission, e.target.checked);
              }}
              size="small"
              sx={{ padding: 0 }}
            />
          </TableCell>
        ))}
      </TableRow>

      {collapse.value &&
        screens.map((screen) => (
          <TableRow hover key={screen}>
            <TableCell sx={{ paddingLeft: 3 }}>
              <Typography variant="body2">{getScreenDisplayName(screen)}</Typography>
            </TableCell>
            {PERMISSIONS.map((permission) => (
              <TableCell key={permission} align="center">
                <PermissionCheckbox
                  screen={screen}
                  permission={permission}
                  disabled={hasPermissionDisabled(`${screen}_${permission}` as ScreenPermission)}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
    </>
  );
};

export default memo(GroupPermission);
