import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useGood from 'api/good';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { GoodFormData } from 'types/good';
import { Status, statusOptions, getStatusLabel, getStatusColor } from 'constants/status';

// validation
import { goodScheme } from 'validations/good.scheme';
import { Typography } from '@mui/material';

const goodCategories = [
  { code: 'Sawdust', name: 'Sawdust' },
  { code: 'Wood Pellets', name: 'Wood Pellets' },
  { code: 'Wood Chips', name: 'Wood Chips' }
];

const unitOfMeasures = [
  { code: 'TON', name: 'Ton' },
  { code: 'KG', name: 'Kilogram' },
  { code: 'M3', name: 'Cubic Meter' },
  { code: 'PIECE', name: 'Piece' }
];

const booleanOptions = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' }
];

interface GoodUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}

export default function GoodUpdateOrInsert({ mode = 'create' }: GoodUpdateOrInsertProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useGood();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchGood = (isEditing || isViewing) && !!id;
  const goodId = shouldFetchGood ? Number(id) : 0;

  const { good, goodLoading, goodError } = getById(goodId);

  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      description: '',
      // category: '',
      // brand: '',
      // model: '',
      // sku: '',
      // barcode: '',
      // unitOfMeasure: '',
      weight: 0,
      // dimensions: '',
      purchasePrice: 0,
      sellingPrice: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderPoint: 0,
      isSellable: 1,
      isPurchasable: 1,
      taxRate: 0,
      supplierId: 0,
      // originCountry: '',
      expiryDays: 0,
      status: Status.ACTIVE
    } as GoodFormData,
    validationSchema: goodScheme,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (isCreating) {
          await create(values);
        } else if (isEditing && good && id) {
          await update(Number(id), values);
        }

        const message = isCreating ? 'Good created successfully' : 'Good updated successfully';
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/good');
      } catch (error) {
        console.error('Error saving good:', error);
        openSnackbar({
          open: true,
          message: 'Error saving good data',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (good && shouldFetchGood) {
      formik.setValues({
        code: good.code || '',
        name: good.name || '',
        description: good.description || '',
        category: good.category || '',
        brand: good.name || '',
        model: good.model || '',
        sku: good.sku || '',
        barcode: good.barcode || '',
        unitOfMeasure: good.unitOfMeasure || '',
        weight: good.weight || 0,
        dimensions: good.dimensions || '',
        purchasePrice: good.purchasePrice || 0,
        sellingPrice: good.sellingPrice || 0,
        minStockLevel: good.minStockLevel || 0,
        maxStockLevel: good.maxStockLevel || 0,
        reorderPoint: good.reorderPoint || 0,
        isSellable: good.isSellable ?? 1,
        isPurchasable: good.isPurchasable ?? 1,
        taxRate: good.taxRate || 0,
        supplierId: good.supplierId || 0,
        originCountry: good.originCountry || '',
        expiryDays: good.expiryDays || 0,
        status: good.status ?? Status.ACTIVE
      });
      formik.validateForm();
    }
  }, [good, shouldFetchGood]);

  useEffect(() => {
    if (goodError && shouldFetchGood) {
      console.error('Error fetching good data:', goodError);
      openSnackbar({
        open: true,
        message: 'Error loading good data',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [goodError, shouldFetchGood]);
  // useEffect(() => {
  //     console.log('Chế độ hiện tại:', mode);
  //   }, [mode]);
  //   useEffect(() => {
  //     console.log('Lỗi biểu mẫu:', formik.errors);
  //     console.log('Giá trị biểu mẫu:', formik.values);

  //   }, [formik.errors, formik.values]);
  const getTitle = () => {
    if (isViewing) return 'View Good';
    if (isEditing) return 'Edit Good';
    return 'Create New Good';
  };

  if (goodLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Loading good data...</div>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="code">
                Code{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="code"
                name="code"
                placeholder="Enter good code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="name">
                Name{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                placeholder="Enter good name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="sku">
                SKU{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="sku"
                name="sku"
                placeholder="Enter SKU"
                value={formik.values.sku}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sku && Boolean(formik.errors.sku)}
                helperText={formik.touched.sku && formik.errors.sku}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="description">
                Description{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="description"
                name="description"
                placeholder="Enter description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Category & Brand */}
          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="category">
                Category{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                <Select
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {goodCategories.map((category) => (
                    <MenuItem key={category.code} value={category.code}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && <FormHelperText>{formik.errors.category}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="brand">
                Brand{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="brand"
                name="brand"
                placeholder="Enter brand"
                value={formik.values.brand}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="model">
                Model{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="model"
                name="model"
                placeholder="Enter model"
                value={formik.values.model}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Physical Properties */}
          {/* <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Physical Properties
            </Typography>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="barcode">
                Barcode{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="barcode"
                name="barcode"
                placeholder="Enter barcode"
                value={formik.values.barcode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.barcode && Boolean(formik.errors.barcode)}
                helperText={formik.touched.barcode && formik.errors.barcode}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="unitOfMeasure">
                Unit of Measure{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.unitOfMeasure && Boolean(formik.errors.unitOfMeasure)}>
                <Select
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formik.values.unitOfMeasure}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {unitOfMeasures.map((unit) => (
                    <MenuItem key={unit.code} value={unit.code}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.unitOfMeasure && formik.errors.unitOfMeasure && (
                  <FormHelperText>{formik.errors.unitOfMeasure}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="weight">
                Weight{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="weight"
                name="weight"
                type="number"
                placeholder="Enter weight"
                value={formik.values.weight}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.weight && Boolean(formik.errors.weight)}
                helperText={formik.touched.weight && formik.errors.weight}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="dimensions">
                Dimensions{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="dimensions"
                name="dimensions"
                placeholder="Enter dimensions (e.g., 50cm x 30cm x 20cm)"
                value={formik.values.dimensions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dimensions && Boolean(formik.errors.dimensions)}
                helperText={formik.touched.dimensions && formik.errors.dimensions}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Pricing */}
          {/* <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Pricing Information
            </Typography>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="purchasePrice">
                Purchase Price{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                placeholder="Enter purchase price"
                value={formik.values.purchasePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
                helperText={formik.touched.purchasePrice && formik.errors.purchasePrice}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="sellingPrice">
                Selling Price{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                placeholder="Enter selling price"
                value={formik.values.sellingPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sellingPrice && Boolean(formik.errors.sellingPrice)}
                helperText={formik.touched.sellingPrice && formik.errors.sellingPrice}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="taxRate">
                Tax Rate (%){' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="taxRate"
                name="taxRate"
                type="number"
                placeholder="Enter tax rate"
                value={formik.values.taxRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.taxRate && Boolean(formik.errors.taxRate)}
                helperText={formik.touched.taxRate && formik.errors.taxRate}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Stock Management */}
          {/* <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Stock Management
            </Typography>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="minStockLevel">
                Min Stock Level{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                placeholder="Enter minimum stock level"
                value={formik.values.minStockLevel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.minStockLevel && Boolean(formik.errors.minStockLevel)}
                helperText={formik.touched.minStockLevel && formik.errors.minStockLevel}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="maxStockLevel">
                Max Stock Level{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="maxStockLevel"
                name="maxStockLevel"
                type="number"
                placeholder="Enter maximum stock level"
                value={formik.values.maxStockLevel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maxStockLevel && Boolean(formik.errors.maxStockLevel)}
                helperText={formik.touched.maxStockLevel && formik.errors.maxStockLevel}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="reorderPoint">
                Reorder Point{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="reorderPoint"
                name="reorderPoint"
                type="number"
                placeholder="Enter reorder point"
                value={formik.values.reorderPoint}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reorderPoint && Boolean(formik.errors.reorderPoint)}
                helperText={formik.touched.reorderPoint && formik.errors.reorderPoint}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* Additional Information */}
          {/* <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Additional Information
            </Typography>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="isSellable">
                Is Sellable{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.isSellable && Boolean(formik.errors.isSellable)}>
                <Select
                  id="isSellable"
                  name="isSellable"
                  value={formik.values.isSellable}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {booleanOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.isSellable && formik.errors.isSellable && <FormHelperText>{formik.errors.isSellable}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="isPurchasable">
                Is Purchasable{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.isPurchasable && Boolean(formik.errors.isPurchasable)}>
                <Select
                  id="isPurchasable"
                  name="isPurchasable"
                  value={formik.values.isPurchasable}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {booleanOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.isPurchasable && formik.errors.isPurchasable && (
                  <FormHelperText>{formik.errors.isPurchasable}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="originCountry">
                Origin Country{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="originCountry"
                name="originCountry"
                placeholder="Enter origin country"
                value={formik.values.originCountry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.originCountry && Boolean(formik.errors.originCountry)}
                helperText={formik.touched.originCountry && formik.errors.originCountry}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="supplierId">
                Supplier ID{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="supplierId"
                name="supplierId"
                type="number"
                placeholder="Enter supplier ID"
                value={formik.values.supplierId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.supplierId && Boolean(formik.errors.supplierId)}
                helperText={formik.touched.supplierId && formik.errors.supplierId}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="expiryDays">
                Expiry Days{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="expiryDays"
                name="expiryDays"
                type="number"
                placeholder="Enter expiry days"
                value={formik.values.expiryDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryDays && Boolean(formik.errors.expiryDays)}
                helperText={formik.touched.expiryDays && formik.errors.expiryDays}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="status">
                Status{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <Select
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip variant="light" color={getStatusColor(option.value)} size="small" label={getStatusLabel(option.value)} />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && <FormHelperText>{formik.errors.status}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
        </Grid>

        {!isViewing && (
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => navigate('/master/good')} color="secondary">
              Cancel
            </Button>
            <AnimateButton>
              <Button disableElevation disabled={loading} size="large" type="submit" variant="contained" color="primary">
                {loading ? 'Saving...' : isEditing ? 'Update Good' : 'Create Good'}
              </Button>
            </AnimateButton>
          </Stack>
        )}
      </form>
    </MainCard>
  );
}
