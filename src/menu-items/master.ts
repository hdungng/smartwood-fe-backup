// project imports

// assets
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';
import BuildOutlined from '@ant-design/icons/BuildOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import CustomerServiceOutlined from '@ant-design/icons/CustomerServiceOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ProductOutlined from '@ant-design/icons/ProductOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  PlusOutlined,
  LinkOutlined,
  ShopOutlined,
  DollarOutlined,
  ProductOutlined,
  TruckOutlined,
  CarOutlined
};

// ==============================|| MENU ITEMS - MASTER ||============================== //

const master: NavItemType = {
  id: 'group-master',
  title: 'master',
  icon: icons.AppstoreAddOutlined,
  type: 'group',
  children: [
    {
      id: 'customer',
      title: '1. customer-management',
      type: 'collapse',
      icon: icons.UserOutlined,
      children: [
        {
          id: 'customer-list',
          title: 'list',
          type: 'item',
          url: '/master/customer',
          breadcrumbs: false,
          permissions: ['M_CUSTOMER_VIEW']
        }
        // TODO
        // {
        //   id: 'customer-contract',
        //   title: 'Hợp đồng nguyên tắc',
        //   type: 'item',
        //   url: '/master/customer-contract',
        //   breadcrumbs: false,
        //   children: [
        //     {
        //       id: 'customer-contract-create',
        //       title: 'Tạo mới',
        //       type: 'hidden',
        //       url: '/create'
        //     }
        //   ]
        // }
      ]
    },
    {
      id: 'user',
      title: '2. user-management',
      type: 'item',
      icon: icons.UserOutlined,
      url: '/master/user',
      permissions: ['M_USER_VIEW']
    },
    {
      id: 'supplier',
      title: '3. supplier-management',
      type: 'item',
      icon: icons.ShopOutlined,
      url: '/master/supplier',
      permissions: ['M_SUPPLIER_VIEW']
    },
    {
      id: 'product',
      title: '4. good-management',
      type: 'item',
      icon: icons.ProductOutlined,
      url: '/master/good',
      permissions: ['M_GOOD_VIEW']
    },
    {
      id: 'price',
      title: '5. price-management',
      type: 'item',
      icon: icons.DollarOutlined,
      url: '/master/exchange-rate',
      permissions: ['M_PRICE_VIEW']
    },
    // TODO
    // {
    //   id: 'documents',
    //   title: '6. documents',
    //   type: 'item',
    //   icon: icons.FileTextOutlined,
    //   url: '/master/documents'
    // },
    {
      id: 'payment-term',
      title: '7. payment-term-management',
      type: 'item',
      icon: icons.DollarOutlined,
      url: '/master/payment-term',
      permissions: ['M_PAYMENT_TERM_VIEW']
    },
    {
      id: 'delivery-term',
      title: '8. delivery-term-management',
      type: 'item',
      icon: icons.ShoppingCartOutlined,
      url: '/master/delivery-term',
      permissions: ['M_DELIVERY_TERM_VIEW']
    },
    {
      id: 'shipping-unit',
      title: '9. shipping-unit-management',
      type: 'item',
      icon: icons.BuildOutlined,
      url: '/master/shipping-unit',
      permissions: ['M_SHIPPING_UNIT_VIEW']
    },
    {
      id: 'forwarder',
      title: '10. forwarder-management',
      type: 'item',
      icon: icons.TruckOutlined,
      url: '/master/forwarder',
      permissions: ['M_FORWARDER_VIEW']
    },
    {
      id: 'shipping-line',
      title: '11. shipping-line-management',
      type: 'item',
      icon: icons.CarOutlined,
      url: '/master/shipping-line',
      permissions: ['M_SHIPPING_LINE_VIEW']
    },
    {
      id: 'logistics-cost',
      title: '12. cost-management',
      type: 'item',
      icon: icons.LinkOutlined,
      url: '/master/logistics-cost',
      permissions: ['M_LOGISTICS_COST_VIEW']
    },
    {
      id: 'good-supplier',
      title: '13. price-management',
      type: 'item',
      icon: icons.DollarOutlined,
      url: '/master/good-supplier'
    }
    // {
    //   id: 'invoice',
    //   title: 'invoice',
    //   url: '/apps/invoice/dashboard',
    //   type: 'collapse',
    //   icon: icons.FileTextOutlined,
    //   breadcrumbs: false,
    //   children: [
    //     {
    //       id: 'invoice-create',
    //       title: 'create',
    //       type: 'item',
    //       url: '/apps/invoice/create',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'invoice-details',
    //       title: 'details',
    //       type: 'item',
    //       link: '/apps/invoice/details/:id',
    //       url: '/apps/invoice/details/1',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'invoice-list',
    //       title: 'list',
    //       type: 'item',
    //       url: '/apps/invoice/list',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'invoice-edit',
    //       title: 'edit',
    //       type: 'item',
    //       link: '/apps/invoice/edit/:id',
    //       url: '/apps/invoice/edit/1',
    //       breadcrumbs: false
    //     }
    //   ]
    // },
  ]
};

export default master;
