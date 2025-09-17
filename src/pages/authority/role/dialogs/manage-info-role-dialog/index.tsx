import { CustomButton } from 'components/buttons';
import { Field, Form, useFormResolver } from 'forms';
import Stack from '@mui/material/Stack';
import { CustomDialog } from 'components/@extended/dialog';
import * as yup from 'yup';
import { validateErrors } from 'utils';
import { DialogRequest, useToast } from 'contexts';
import { authorityService, CreateRoleRequest, ListRoleResponse } from 'services/authority';
import { useEffect } from 'react';

const schema = yup.object().shape({
  name: yup.string().required(validateErrors.required),
  description: yup.string().optional()
});

type FormProps = yup.InferType<typeof schema>;

type Props = DialogRequest & {
  role?: ListRoleResponse;
};

const ManageInfoRoleDialog = ({ role, ...otherProps }: Props) => {
  const isEdit = !!role;
  const toast = useToast();
  const form = useFormResolver(schema, {
    defaultValues: {
      name: role?.name || '',
      description: role?.description || ''
    }
  });

  const {
    reset,
    formState: { isDirty, isLoading, isValid }
  } = form;

  useEffect(() => {
    if (isEdit && role) {
      reset({
        ...role
      });
    }
  }, [isEdit, role, form]);

  const handleSubmit = async (values: FormProps) => {
    const payload: CreateRoleRequest = {
      name: values.name,
      description: values.description,
      permissions: (role?.permissions || []).map((p) => p.id)
    };

    if (isEdit && role) {
      const response = await authorityService.updateRole({
        id: role.id,
        ...payload
      });
      if (!response?.success) {
        toast.error('Cập nhật vai trò thất bại');
        return;
      }

      toast.success('Cập nhật vai trò thành công');
    } else {
      const response = await authorityService.createRole(payload);
      if (!response?.success) {
        toast.error('Tạo mới vai trò thất bại');
        return;
      }

      toast.success('Tạo mới vai trò thành công');
    }

    otherProps.onClose({
      success: true
    });
  };

  return (
    <CustomDialog
      title={isEdit ? 'Chỉnh sửa' : 'Tạo mới vai trò'}
      {...otherProps}
      action={
        <>
          <CustomButton variant="outlined" color="inherit" onClick={() => otherProps.onClose()} disabled={isLoading}>
            Đóng
          </CustomButton>
          <CustomButton variant="contained" type="submit" form="manage-role-form" disabled={isLoading || (!isDirty && isEdit) || !isValid}>
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
          <Field.Text name="name" label="Tên vai trò" required />
          <Field.Text name="description" label="Mô tả" multiline rows={3} />
        </Stack>
      </Form>
    </CustomDialog>
  );
};

export default ManageInfoRoleDialog;
