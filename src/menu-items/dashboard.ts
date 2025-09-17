// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import QrcodeOutlined from '@ant-design/icons/QrcodeOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';
import LineChartOutlined from '@ant-design/icons/LineChartOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  DashboardOutlined,
  UserOutlined,
  GlobalOutlined,
  QrcodeOutlined,
  TruckOutlined,
  CalculatorOutlined,
  LineChartOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FundOutlined
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard: NavItemType = {
  id: 'group-dashboard',
  title: 'dashboard',
  type: 'group',
  icon: icons.DashboardOutlined,
  children: [
    {
      id: 'dashboard',
      title: 'dashboard',
      type: 'collapse',
      icon: icons.DashboardOutlined,
      children: [
        // {
        //   id: 'BLD',
        //   title: 'executive-board',
        //   type: 'item',
        //   url: '/dashboard/executive-board',
        //   icon: icons.UserOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'TMQT',
        //   title: 'international-trade',
        //   type: 'item',
        //   url: '/dashboard/international-trade',
        //   icon: icons.GlobalOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'QC-N',
        //   title: 'qc-domestic',
        //   type: 'item',
        //   url: '/dashboard/qc-domestic',
        //   icon: icons.QrcodeOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'QC-Logistics',
        //   title: 'qc-logistics',
        //   type: 'item',
        //   url: '/dashboard/qc-logistics',
        //   icon: icons.TruckOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'Ketoan',
        //   title: 'accounting',
        //   type: 'item',
        //   url: '/dashboard/accounting',
        //   icon: icons.CalculatorOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'market-overview',
        //   title: 'market-overview',
        //   type: 'item',
        //   url: '/dashboard/market-overview',
        //   icon: icons.LineChartOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'customers',
        //   title: 'customers-dashboard',
        //   type: 'item',
        //   url: '/dashboard/customers',
        //   icon: icons.TeamOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'suppliers',
        //   title: 'suppliers-dashboard',
        //   type: 'item',
        //   url: '/dashboard/suppliers',
        //   icon: icons.ShopOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'order-tracking',
        //   title: 'order-tracking',
        //   type: 'item',
        //   url: '/dashboard/order-tracking',
        //   icon: icons.ShoppingCartOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'revenue-summary',
        //   title: 'revenue-summary',
        //   type: 'item',
        //   url: '/dashboard/revenue-summary',
        //   icon: icons.DollarOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'receivables',
        //   title: 'receivables',
        //   type: 'item',
        //   url: '/dashboard/receivables',
        //   icon: icons.CreditCardOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'payables',
        //   title: 'payables',
        //   type: 'item',
        //   url: '/dashboard/payables',
        //   icon: icons.CreditCardOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'cost-summary',
        //   title: 'cost-summary',
        //   type: 'item',
        //   url: '/dashboard/cost-summary',
        //   icon: icons.FundOutlined,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'usd-exchange',
        //   title: 'usd-exchange',
        //   type: 'item',
        //   url: '/dashboard/usd-exchange',
        //   icon: icons.DollarOutlined,
        //   breadcrumbs: false
        // }
        {
          id: 'market-overview',
          title: 'market-overview',
          type: 'item',
          url: '/dashboard/market-overview',
          icon: icons.LineChartOutlined,
          breadcrumbs: false
        },
        {
          id: 'customers',
          title: 'customers-dashboard',
          type: 'item',
          url: '/dashboard/customers',
          icon: icons.TeamOutlined,
          breadcrumbs: false
        },
        {
          id: 'suppliers',
          title: 'suppliers-dashboard',
          type: 'item',
          url: '/dashboard/suppliers',
          icon: icons.ShopOutlined,
          breadcrumbs: false
        },
        {
          id: 'order-tracking',
          title: 'order-tracking',
          type: 'item',
          url: '/dashboard/order-tracking',
          icon: icons.ShoppingCartOutlined,
          breadcrumbs: false
        },
        {
          id: 'todo-list',
          title: 'todo-list',
          type: 'item',
          url: '/dashboard/todo-list',
          icon: icons.ShoppingCartOutlined,
          breadcrumbs: false
        },
        {
          id: 'revenue-summary',
          title: 'revenue-summary',
          type: 'item',
          url: '/dashboard/revenue-summary',
          icon: icons.DollarOutlined,
          breadcrumbs: false
        },
        {
          id: 'receivables',
          title: 'receivables',
          type: 'item',
          url: '/dashboard/receivables',
          icon: icons.CreditCardOutlined,
          breadcrumbs: false
        },
        {
          id: 'payables',
          title: 'payables',
          type: 'item',
          url: '/dashboard/payables',
          icon: icons.CreditCardOutlined,
          breadcrumbs: false
        },
        {
          id: 'cost-summary',
          title: 'cost-summary',
          type: 'item',
          url: '/dashboard/cost-summary',
          icon: icons.FundOutlined,
          breadcrumbs: false
        },
        {
          id: 'usd-exchange',
          title: 'usd-exchange',
          type: 'item',
          url: '/dashboard/usd-exchange',
          icon: icons.DollarOutlined,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default dashboard;
