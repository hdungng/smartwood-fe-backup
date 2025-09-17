import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as yup from 'yup';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { UserFormData } from 'types/user.type';

// assets
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { userScheme } from 'validations/user.scheme';
import useUser from 'api/user';
import { Status, statusOptions, getStatusLabel, getStatusColor } from 'constants/status';

const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' }
];

interface UserUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

// ==============================|| USER UPDATE OR INSERT ||============================== //

export default function UserUpdateOrInsert({ mode = 'create' }: UserUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useUser();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Use the hook properly - only call when we have an id and are editing/viewing
  const shouldFetchUser = (isEditing || isViewing) && !!id;
  const userId = shouldFetchUser ? Number(id) : 0;

  const { user, userLoading, userError } = getById(userId);

  // Handle user data when it's loaded
  useEffect(() => {
    if (user && shouldFetchUser) {
      formik.setValues({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        language: user.language || '',
        password: '',
        roleId: user.roleId || 1, // Default to Manager (ID: 1)
        status: user.status ?? Status.ACTIVE
      });
      // Revalidate form after setting values
      formik.validateForm();
    }
  }, [user, shouldFetchUser]);

  // Handle user fetch error
  useEffect(() => {
    if (userError && shouldFetchUser) {
      console.error('Error fetching user data:', userError);
      openSnackbar({
        open: true,
        message: 'Error loading user data',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [userError, shouldFetchUser]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      username: '',
      language: '',
      password: '',
      roleId: 1, // Use numeric ID default (Manager)
      status: Status.ACTIVE
    } as UserFormData,
    validationSchema: userScheme.shape({
      password: isCreating
        ? yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
        : yup.string().optional()
    }),
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // console.log('Form values being submitted:', values); // Debug log

        if (isCreating) {
          // Create new user
          await create(values);
        } else if (isEditing && user && id) {
          // Update existing user - only send changed fields
          const updateData: Partial<UserFormData> = { ...values };

          // Don't send password if it's empty (keep current password)
          if (!values.password) {
            delete updateData.password;
          }

          await update(Number(id), updateData);
        }

        const message = isCreating ? 'User created successfully' : 'User updated successfully';

        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/user');
      } catch (error) {
        console.error('Error saving user:', error);
        openSnackbar({
          open: true,
          message: 'Error saving user data',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getTitle = () => {
    if (isViewing) return 'View User';
    if (isEditing) return 'Edit User';
    return 'Create New User';
  };

  // Show loading state when fetching user data
  if (userLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading user data...</Typography>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="name">Full Name *</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Username */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="username">Username *</InputLabel>
              <TextField
                fullWidth
                id="username"
                name="username"
                placeholder="Enter username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Email */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="email">Email Address *</InputLabel>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Password */}
          {(isCreating || isEditing) && (
            <Grid size={4}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="password">Password {isCreating ? '*' : '(Leave blank to keep current)'}</InputLabel>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isCreating ? 'Enter password' : 'Enter new password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Stack>
            </Grid>
          )}

          {/* Role */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="roleId">Role *</InputLabel>
              <FormControl fullWidth error={formik.touched.roleId && Boolean(formik.errors.roleId)} disabled={isViewing}>
                <Select
                  id="roleId"
                  name="roleId"
                  value={formik.values.roleId || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Role
                  </MenuItem>
                </Select>
                {formik.touched.roleId && formik.errors.roleId && <FormHelperText>{formik.errors.roleId}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          {/* Status */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="status">Status *</InputLabel>
              {isViewing ? (
                <Box sx={{ pt: 1 }}>
                  <Chip
                    label={getStatusLabel(formik.values.status ?? Status.ACTIVE)}
                    color={getStatusColor(formik.values.status ?? Status.ACTIVE)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              ) : (
                <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                  <Select
                    id="status"
                    name="status"
                    value={formik.values.status ?? ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Status
                    </MenuItem>
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status && formik.errors.status && <FormHelperText>{formik.errors.status}</FormHelperText>}
                </FormControl>
              )}
            </Stack>
          </Grid>

          {/* Language */}
          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="language">Language</InputLabel>
              <FormControl fullWidth disabled={isViewing}>
                <Select
                  id="language"
                  name="language"
                  value={formik.values.language || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  displayEmpty
                >
                  <MenuItem value="">Select Language</MenuItem>
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Action Buttons */}
          <Grid size={12}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/master/user')}>
                {isViewing ? 'Back' : 'Cancel'}
              </Button>

              {!isViewing && (
                <AnimateButton>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    onClick={() => {
                      console.log('Submit button clicked');
                      console.log('Form errors:', formik.errors);
                      console.log('Form values:', formik.values);
                      console.log('Form isValid:', formik.isValid);
                    }}
                  >
                    {loading ? 'Saving...' : isCreating ? 'Create User' : 'Update User'}
                  </Button>
                </AnimateButton>
              )}

              {isViewing && (
                <AnimateButton>
                  <Button variant="contained" onClick={() => navigate(`/master/user/edit/${id}`)}>
                    Edit User
                  </Button>
                </AnimateButton>
              )}
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
}
