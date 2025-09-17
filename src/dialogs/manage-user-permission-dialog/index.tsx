import { DialogRequest, useToast } from 'contexts';
import { authorityService, ListRoleResponse, ListUserPermissionResponse } from 'services/authority';
import { useEffect, useMemo, useState } from 'react';
import { CustomDialog } from 'components/@extended/dialog';
import { CustomButton } from 'components/buttons';
import { Field, Form, useFormResolver } from '../../forms';
import Stack from '@mui/material/Stack';
import * as yup from 'yup';
import { Input } from 'components/@extended/input';
import { useAuth, useConfiguration } from '../../hooks';
import { CODE_REGION } from '../../constants/code';
import { SelectionOption } from 'types/common';
import { validateErrors } from '../../utils';

const schema = yup.object().shape({
  roles: yup.array().of(yup.mixed<SelectionOption>()).min(1, 'Vui lòng chọn ít nhất một vai trò').required(validateErrors.required),
  regions: yup.array().of(yup.mixed<SelectionOption>()).min(1, 'Vui lòng chọn ít nhất một khu vực').required(validateErrors.required)
});

type FormValues = yup.InferType<typeof schema>;

type Props = DialogRequest & {
  userPermission?: ListUserPermissionResponse;
};

const ManageUserPermissionDialog = ({ userPermission, ...otherProps }: Props) => {
  const toast = useToast();
  const { mapConfigSelection } = useConfiguration();
  const [roles, setRoles] = useState<ListRoleResponse[]>([]);
  const { user } = useAuth();

  const form = useFormResolver(schema, {
    defaultValues: {
      roles: [],
      regions: []
    }
  });

  const {
    reset,
    formState: { isDirty, isLoading, isValid }
  } = form;

  const isEdit = useMemo(() => !!userPermission, [userPermission]);

  useEffect(() => {
    (async () => {
      const response = await authorityService.listRole();
      setRoles(response.data || []);
    })();
  }, []);

  const regionOptions = useMemo(() => mapConfigSelection(CODE_REGION), [mapConfigSelection]);

  const roleOptions = useMemo(
    () =>
      (roles || []).map((role) => ({
        label: role.name,
        value: role.id
      })) as SelectionOption[],
    [roles]
  );

  useEffect(() => {
    if (regionOptions.length === 0 || roleOptions.length === 0 || !userPermission) return;

    const { roleIds = [], regions = [] } = userPermission as ListUserPermissionResponse;

    reset({
      roles: roleOptions.filter((role) => roleIds.includes(role.value as number)) || [],
      regions: regionOptions.filter((region) => regions.includes(region.value as string)) || []
    });
  }, [regionOptions.length, roleOptions.length, userPermission?.regions, userPermission?.roleIds, reset]);

  const handleSubmit = async (data: FormValues) => {
    if (!userPermission?.id) return;

    const response = await authorityService.assignPermissionForUser(userPermission.id, {
      roleIds: data.roles.map((role) => role!.value as number),
      regions: data.regions.map((region) => region!.value as string)
    });

    if (!response.success) {
      toast.error(response.error || 'Cập nhật quyền người dùng thất bại');
      return;
    }

    if (isCurrentUser) {
      window.location.reload();
    } else {
      toast.success('Cập nhật quyền người dùng thành công');
      otherProps.onClose({ success: true });
    }
  };

  const isCurrentUser = useMemo(() => user?.email === userPermission?.email, [user?.email, userPermission?.email]);

  return (
    <CustomDialog
      title="Chỉnh sửa quyền người dùng"
      {...otherProps}
      maxWidth="sm"
      action={
        <>
          <CustomButton variant="outlined" color="inherit" onClick={() => otherProps.onClose()} disabled={isLoading}>
            Đóng
          </CustomButton>
          <CustomButton
            variant="contained"
            type="submit"
            form="manage-user-permission-form"
            disabled={isLoading || (!isDirty && isEdit) || !isValid}
          >
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
            id: 'manage-user-permission-form'
          }
        }}
      >
        <Stack spacing={2}>
          <Input.Text value={userPermission?.email} disabled label="Email" />

          <Field.Autocomplete
            options={roleOptions}
            name="roles"
            multiple
            disableCloseOnSelect
            label="Vai trò"
            placeholder="Chọn vai trò"
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label}
          />

          <Field.Autocomplete
            options={regionOptions}
            name="regions"
            multiple
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label}
            label="Khu vực"
            placeholder="Chọn khu vực"
          />

          {isCurrentUser && (
            <Stack sx={{ bgcolor: 'warning.lighter', p: 2, borderRadius: 1 }} spacing={1}>
              <strong>Lưu ý:</strong>
              <div>
                Bạn đang chỉnh sửa quyền của chính mình. Việc thay đổi quyền có thể ảnh hưởng đến khả năng truy cập hiện tại của bạn.
              </div>
              <div>Sau khi thay đổi hệ thống sẽ tự động tải lại để có thông tin mới nhất.</div>
            </Stack>
          )}
        </Stack>
      </Form>
    </CustomDialog>
  );
};

export default ManageUserPermissionDialog;
