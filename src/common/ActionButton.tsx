import { DeleteOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Stack } from '@mui/material';
import { MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { PermissionGuard } from 'components/guards';
import { ScreenPermission } from 'services/authority';
import { CustomIconButton } from 'components/buttons';

type Action = 'view' | 'edit' | 'detail' | 'delete' | 'activate';

type ActionButtonsProps = {
  permissionsOnAction: Partial<Record<Action, ScreenPermission>>;
  onView?: () => void;
  onEdit?: () => void;
  onDetail?: () => void;
  onDelete?: (e: MouseEvent<HTMLButtonElement>) => void;
  onActivate?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const ActionButtons = ({ permissionsOnAction, onView, onEdit, onDetail, onDelete, onActivate }: ActionButtonsProps) => {
  const intl = useIntl();

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
      {onView && (
        <PermissionGuard permission={permissionsOnAction?.['view']}>
          <CustomIconButton color="secondary" onClick={onView} title={intl.formatMessage({ id: 'preview_label' })} icon={<EyeOutlined />} />
        </PermissionGuard>
      )}
      {onEdit && (
        <PermissionGuard permission={permissionsOnAction?.['edit']}>
          <CustomIconButton tooltip={intl.formatMessage({ id: 'edit_label' })} color="primary" onClick={onEdit} icon={<EditOutlined />} />
        </PermissionGuard>
      )}
      {onDetail && (
        <PermissionGuard permission={permissionsOnAction?.['detail']}>
          <CustomIconButton
            tooltip={intl.formatMessage({ id: 'detail_label' })}
            color="info"
            onClick={onDetail}
            icon={<SettingOutlined />}
          />
        </PermissionGuard>
      )}
      {onActivate && (
        <PermissionGuard permission={permissionsOnAction?.['activate']}>
          <CustomIconButton
            tooltip={intl.formatMessage({ id: 'activate_label' })}
            color="success"
            onClick={onActivate}
            icon={<CheckCircleOutlined />}
          />
        </PermissionGuard>
      )}

      {onDelete && (
        <PermissionGuard permission={permissionsOnAction?.['delete']}>
          <CustomIconButton
            tooltip={intl.formatMessage({ id: 'delete_label' })}
            color="error"
            onClick={onDelete}
            icon={<DeleteOutlined />}
          />
        </PermissionGuard>
      )}
    </Stack>
  );
};
