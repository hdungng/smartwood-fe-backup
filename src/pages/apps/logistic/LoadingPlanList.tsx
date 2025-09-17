import { PlusOutlined as AddIcon, DeleteOutlined as DeleteIcon } from '@ant-design/icons';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Mock data for dropdowns
const mockData = {
  goods: [
    { value: 'goods1', label: 'Hàng hóa 1' },
    { value: 'goods2', label: 'Hàng hóa 2' },
    { value: 'goods3', label: 'Hàng hóa 3' }
  ],
  factories: [
    { value: 'factory1', label: 'Xưởng 1', price: '1000' },
    { value: 'factory2', label: 'Xưởng 2', price: '1200' },
    { value: 'factory3', label: 'Xưởng 3', price: '1100' }
  ],
  qualityTypes: [
    { value: 'type1', label: 'Loại 1' },
    { value: 'type2', label: 'Loại 2' },
    { value: 'type3', label: 'Loại 3' }
  ]
};

interface FactoryType {
  factoryName: string;
  quantity: string;
  price: string;
  qualityType: string;
  loadingTimeFrom: Date | null;
  loadingTimeTo: Date | null;
}

interface ProductType {
  goodsName: string;
  factories: FactoryType[];
}

interface LoadingPlanListProps {
  products: ProductType[];
  onProductsChange: (products: ProductType[]) => void;
  errors?: any;
  touched?: any;
}

const LoadingPlanList = ({ products, onProductsChange, errors, touched }: LoadingPlanListProps) => {
  const handleAddFactory = (productIndex: number) => {
    const newProducts = [...products];
    newProducts[productIndex].factories.push({
      factoryName: '',
      quantity: '',
      price: '',
      qualityType: '',
      loadingTimeFrom: null,
      loadingTimeTo: null
    });
    onProductsChange(newProducts);
  };

  const handleRemoveFactory = (productIndex: number, factoryIndex: number) => {
    const newProducts = [...products];
    newProducts[productIndex].factories = newProducts[productIndex].factories.filter((_, i) => i !== factoryIndex);
    onProductsChange(newProducts);
  };

  const handleFactoryChange = (productIndex: number, factoryIndex: number, field: keyof FactoryType, value: any) => {
    const newProducts = [...products];
    newProducts[productIndex].factories[factoryIndex][field] = value;

    // If factory name changes, update price from mock data
    if (field === 'factoryName') {
      const factory = mockData.factories.find((f) => f.value === value);
      if (factory) {
        newProducts[productIndex].factories[factoryIndex].price = factory.price;
      }
    }

    onProductsChange(newProducts);
  };

  const getFieldError = (path: string) => {
    const error = errors?.[path];
    const isTouched = touched?.[path];
    return isTouched && error ? error : '';
  };

  return (
    <Box>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên hàng hóa</TableCell>
                <TableCell>Tên Xưởng/nhà máy</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn giá</TableCell>
                <TableCell>Loại chất lượng</TableCell>
                <TableCell>Thời gian bắt đầu</TableCell>
                <TableCell>Thời gian kết thúc</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, productIndex) =>
                product.factories.map((factory, factoryIndex) => (
                  <TableRow key={`${productIndex}-${factoryIndex}`}>
                    <TableCell sx={{ minWidth: 220 }}>
                      <Autocomplete
                        options={mockData.goods}
                        getOptionLabel={(option) => option.label}
                        value={mockData.goods.find((g) => g.value === product.goodsName) || null}
                        onChange={(_, newValue) => {
                          const newProducts = [...products];
                          newProducts[productIndex].goodsName = newValue ? newValue.value : '';
                          onProductsChange(newProducts);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Chọn hàng hóa"
                            error={Boolean(getFieldError(`products.${productIndex}.goodsName`))}
                            helperText={getFieldError(`products.${productIndex}.goodsName`)}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      <Autocomplete
                        options={mockData.factories}
                        getOptionLabel={(option) => option.label}
                        value={mockData.factories.find((f) => f.value === factory.factoryName) || null}
                        onChange={(_, newValue) =>
                          handleFactoryChange(productIndex, factoryIndex, 'factoryName', newValue ? newValue.value : '')
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Chọn xưởng"
                            error={Boolean(getFieldError(`products.${productIndex}.factories.${factoryIndex}.factoryName`))}
                            helperText={getFieldError(`products.${productIndex}.factories.${factoryIndex}.factoryName`)}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={factory.quantity}
                        onChange={(e) => handleFactoryChange(productIndex, factoryIndex, 'quantity', e.target.value)}
                        error={Boolean(getFieldError(`products.${productIndex}.factories.${factoryIndex}.quantity`))}
                        helperText={getFieldError(`products.${productIndex}.factories.${factoryIndex}.quantity`)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth value={factory.price} disabled />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={factory.qualityType}
                          onChange={(e) => handleFactoryChange(productIndex, factoryIndex, 'qualityType', e.target.value)}
                          error={Boolean(getFieldError(`products.${productIndex}.factories.${factoryIndex}.qualityType`))}
                        >
                          <MenuItem value="">Chọn loại chất lượng</MenuItem>
                          {mockData.qualityTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {getFieldError(`products.${productIndex}.factories.${factoryIndex}.qualityType`) && (
                          <FormHelperText error>
                            {getFieldError(`products.${productIndex}.factories.${factoryIndex}.qualityType`)}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {/*<DatePicker*/}
                      {/*  value={factory.loadingTimeFrom}*/}
                      {/*  onChange={(newValue) => handleFactoryChange(productIndex, factoryIndex, 'loadingTimeFrom', newValue)}*/}
                      {/*  slotProps={{*/}
                      {/*    textField: {*/}
                      {/*      fullWidth: true,*/}
                      {/*      size: 'small',*/}
                      {/*      error: Boolean(getFieldError(`products.${productIndex}.factories.${factoryIndex}.loadingTimeFrom`)),*/}
                      {/*      helperText: getFieldError(`products.${productIndex}.factories.${factoryIndex}.loadingTimeFrom`),*/}
                      {/*      sx: {*/}
                      {/*        '.MuiPickersInputBase-root': {*/}
                      {/*          padding: '2px 9px'*/}
                      {/*        }*/}
                      {/*      }*/}
                      {/*    }*/}
                      {/*  }}*/}
                      {/*/>*/}
                    </TableCell>
                    <TableCell>
                      {/*<DatePicker*/}
                      {/*  value={factory.loadingTimeTo}*/}
                      {/*  onChange={(newValue) => handleFactoryChange(productIndex, factoryIndex, 'loadingTimeTo', newValue)}*/}
                      {/*  slotProps={{*/}
                      {/*    textField: {*/}
                      {/*      fullWidth: true,*/}
                      {/*      size: 'small',*/}
                      {/*      error: Boolean(getFieldError(`products.${productIndex}.factories.${factoryIndex}.loadingTimeTo`)),*/}
                      {/*      helperText: getFieldError(`products.${productIndex}.factories.${factoryIndex}.loadingTimeTo`),*/}
                      {/*      sx: {*/}
                      {/*        '.MuiPickersInputBase-root': {*/}
                      {/*          padding: '2px 9px'*/}
                      {/*        }*/}
                      {/*      }*/}
                      {/*    }*/}
                      {/*  }}*/}
                      {/*/>*/}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveFactory(productIndex, factoryIndex)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleAddFactory(0)} sx={{ mt: 2 }}>
        Thêm xưởng
      </Button>
    </Box>
  );
};

export default LoadingPlanList;
