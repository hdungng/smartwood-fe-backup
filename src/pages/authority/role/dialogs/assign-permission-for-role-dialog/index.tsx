import { CustomDialog } from 'components/@extended/dialog';
import Stack from '@mui/material/Stack';
import { PermissionSection } from './sections';
import { Form, useFormResolver } from 'forms';
import * as yup from 'yup';
import { Screen, Permission, ListRoleResponse, authorityService, PermissionBasic, CreateRoleRequest } from 'services/authority';
import { CustomButton } from 'components/buttons';
import { useEffect, useState } from 'react';
import { DialogRequest, useRole, useToast } from 'contexts';
import { useDialog } from '../../../../../hooks';

const permissionSchema = yup.object().shape(
  Object.values(Permission).reduce(
    (acc, permission) => {
      (acc[permission] as any) = yup.boolean().optional();
      return acc;
    },
    {} as Record<Permission, yup.BooleanSchema<boolean | undefined>>
  )
);

const screenPermissionsSchema = yup.object().shape(
  Object.values(Screen).reduce(
    (acc, screen) => {
      (acc[screen] as any) = permissionSchema.optional();
      return acc;
    },
    {} as Record<Screen, typeof permissionSchema>
  )
);

const schema = yup.object().shape({
  permissions: screenPermissionsSchema.optional()
});

type FormProps = yup.InferType<typeof schema>;

type Props = DialogRequest & {
  role: ListRoleResponse;
};

const AssignPermissionForRoleDialog = ({ role, ...otherProps }: Props) => {
  const { availableRoles } = useRole();
  const toast = useToast();
  const dialog = useDialog();
  const [permissions, setPermissions] = useState<PermissionBasic[]>([]);

  useEffect(() => {
    (async () => {
      const response = await authorityService.listPermission();
      setPermissions(response.data || []);
    })();
  }, []);

  const form = useFormResolver<FormProps>(schema, {});
  const {
    reset,
    formState: { isLoading, isValid, isDirty }
  } = form;

  const reverseTransformPermissions = (permissionsArray: string[]): FormProps['permissions'] => {
    const nestedPermissions: Record<string, Record<string, boolean>> = {};

    permissionsArray.forEach((permissionString) => {
      const parts = permissionString.split('_');
      if (parts.length >= 2) {
        const permission = parts.pop() as Permission;
        const screen = parts.join('_') as Screen;

        if (!nestedPermissions[screen]) {
          nestedPermissions[screen] = {};
        }

        nestedPermissions[screen][permission] = true;
      }
    });

    return nestedPermissions as FormProps['permissions'];
  };

  const transformPermissions = (permissions: FormProps['permissions']): string[] => {
    const permissionArray: string[] = [];

    if (permissions) {
      Object.entries(permissions).forEach(([screen, screenPermissions]) => {
        if (screenPermissions) {
          Object.entries(screenPermissions).forEach(([permission, isGranted]) => {
            if (isGranted === true) {
              permissionArray.push(`${screen}_${permission}`);
            }
          });
        }
      });
    }

    return permissionArray;
  };

  const handleSubmit = async (values: FormProps) => {
    const isSelf = availableRoles.map((x) => x.code).includes(role.code);

    if (isSelf) {
      const result = await dialog.confirm({
        title: 'Xác nhận',
        description:
          'Bạn đang chỉnh sửa vai trò của chính mình. Việc thay đổi quyền có thể ảnh hưởng đến khả năng truy cập hiện tại của bạn. Hệ thống sẽ tự động tải lại trang sau khi bạn xác nhận. Bạn có chắc chắn muốn tiếp tục?',
        slotProps: {
          accept: { color: 'info' }
        }
      });

      if (!result?.success) {
        return;
      }
    }

    const payload: CreateRoleRequest = {
      ...role,
      permissions: permissions
        .filter((permission) => transformPermissions(values.permissions).includes(permission.code))
        .map((permission) => permission.id)
    };

    const response = await authorityService.updateRole({
      id: role.id,
      ...payload
    });

    if (!response?.success) {
      toast.error('Phân bố quyền thất bại');
      return;
    }

    toast.success('Phân bố quyền thành công');

    otherProps.onClose({
      success: true
    });

    if (isSelf) {
      window.location.reload();
      return;
    }
  };

  useEffect(() => {
    if (role) {
      reset({
        permissions: reverseTransformPermissions(role.permissions.map((x) => x.code))
      }, {
        keepDirty: false
      });
    }
  }, [role, form]);

  return (
    <CustomDialog
      title={`Phân bố quyền của vai trò ${role.name}`}
      {...otherProps}
      maxWidth="md"
      action={
        <>
          <CustomButton variant="outlined" color="inherit" onClick={() => otherProps.onClose()} disabled={isLoading}>
            Đóng
          </CustomButton>
          <CustomButton variant="contained" type="submit" form="manage-role-form" disabled={isLoading || (!isValid && isDirty) || !isDirty}>
            Lưu
          </CustomButton>
        </>
      }
    >
      <Form
        methods={form}
        onSubmit={handleSubmit}
        slotProps={{
          form: {
            id: 'manage-role-form'
          }
        }}
      >
        <Stack spacing={2}>
          <PermissionSection roleCode={role?.code} />
        </Stack>
      </Form>
    </CustomDialog>
  );
};

export default AssignPermissionForRoleDialog;
