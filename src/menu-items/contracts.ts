// assets
import CloudUploadOutlined from '@ant-design/icons/CloudUploadOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import StepForwardOutlined from '@ant-design/icons/StepForwardOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';
import InsertRowAboveOutlined from '@ant-design/icons/InsertRowAboveOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
// type
import { NavItemType } from 'types/menu';
import FileProtectOutlined from '@ant-design/icons/FileProtectOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import CodeSandboxOutlined from '@ant-design/icons/CodeSandboxOutlined';
import { ApiOutlined, BankOutlined, BugOutlined, GlobalOutlined, RadarChartOutlined } from '@ant-design/icons';
// icons
const icons = {
  CloudUploadOutlined,
  FileDoneOutlined,
  FormOutlined,
  PieChartOutlined,
  StepForwardOutlined,
  TableOutlined,
  InsertRowAboveOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
  CodeSandboxOutlined,
  BankOutlined,
  GlobalOutlined,
  BugOutlined,
  ApiOutlined,
  RadarChartOutlined
};

import { routing } from 'routes/routing';

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const contracts: NavItemType = {
  id: 'group-forms-tables',
  title: 'constract',
  icon: icons.FileDoneOutlined,
  type: 'group',
  children: [
    {
      id: 'PO',
      title: '1. draft-po',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      children: [
        {
          id: 'PO-list',
          title: 'list',
          type: 'item',
          url: '/po/list',
          permissions: ['DRAFT_PO_VIEW']
        },
        {
          id: 'PO-create',
          title: 'create',
          type: 'item',
          url: '/po/create',
          permissions: ['DRAFT_PO_CREATE']
        },
        {
          id: 'PO-edit',
          title: 'edit',
          type: 'item',
          url: '/po/edit',
          permissions: ['DRAFT_PO_UPDATE']
        },
        {
          id: 'business-plan-approve',
          title: 'approve',
          type: 'item',
          url: routing.businessPlan.approval,
          permissions: ['BUSINESS_PLAN_APPROVE']
        }
      ]
    },
    {
      id: 'business-plan',
      title: '2. business-plan',
      type: 'collapse',
      icon: icons.FileProtectOutlined,
      children: [
        {
          id: 'business-plan-list',
          title: 'list',
          type: 'item',
          url: routing.businessPlan.list,
          permissions: ['BUSINESS_PLAN_VIEW']
        },
        {
          id: 'business-plan-create',
          title: 'create',
          type: 'hidden',
          url: routing.businessPlan.create(),
          permissions: ['BUSINESS_PLAN_CREATE']
        },
        {
          id: 'business-plan-update',
          title: 'update',
          type: 'hidden',
          url: routing.businessPlan.edit(),
          permissions: ['BUSINESS_PLAN_UPDATE']
        },
        {
          id: 'business-plan-detail',
          title: 'pakd_detail_title',
          type: 'hidden',
          url: routing.businessPlan.detail(),
          permissions: ['BUSINESS_PLAN_VIEW']
        }
      ]
    },
    {
      id: 'contract-sell',
      title: '3. contract-sell',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      children: [
        {
          id: 'contract-sell-list',
          title: 'list',
          type: 'item',
          url: '/contracts/sales/list',
          permissions: ['SALE_CONTRACT_VIEW']
        },
      ]
    },
    {
      id: 'contract-buy',
      title: '4. contract-buy',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      children: [
        {
          id: 'contract-buy-list',
          title: 'list',
          type: 'item',
          url: '/contracts/purchase/list',
          permissions: ['PURCHASE_ORDER_VIEW']
        },
        {
          id: 'contract-buy-view',
          title: 'view',
          type: 'hidden',
          url: '/contracts/purchase/detail',
          permissions: ['PURCHASE_ORDER_VIEW']
        },
        {
          id: 'contract-buy-edit',
          title: 'edit',
          type: 'hidden',
          url: '/contracts/purchase/edit',
          permissions: ['PURCHASE_ORDER_UPDATE']
        },
        {
          id: 'contract-buy-approve',
          title: 'approve',
          type: 'item',
          url: '/contracts/purchase/approval',
          permissions: ['PURCHASE_ORDER_APPROVE']
        }
      ]
    },
    {
      id: 'logistics',
      title: '5. logistics',
      type: 'collapse',
      icon: icons.ApiOutlined,
      children: [
        {
          id: 'logistics-ship',
          title: 'ship-transport',
          type: 'item',
          url: '/logistics/ship',
          permissions: ['LOGISTICS_SHIP_VIEW']
        },
        {
          id: 'logistics-road',
          title: 'road-transport',
          type: 'item',
          url: '/logistics/truck',
          permissions: ['LOGISTICS_TRUCK_VIEW']
        },
      ]
    },
    {
      id: 'sea-customs',
      title: '6. sea-custom',
      type: 'item',
      icon: icons.GlobalOutlined,
      url: '/sea-customs/list',
      permissions: ['SEA_CUSTOM_VIEW']
    },

    {
      id: 'accounting',
      title: '7. accounting',
      type: 'item',
      icon: icons.BugOutlined,
      url: '/accounting',
      permissions: ['ACCOUNTING_VIEW']
    },
    {
      id: 'inventory',
      title: '8. inventory',
      type: 'collapse',
      icon: icons.CodeSandboxOutlined,
      children: [
        {
          id: 'inventory-import-export',
          title: 'import/export',
          type: 'item',
          url: '/inventory/import-export',
          permissions: ['INVENTORY_VIEW']
        },
        {
          id: 'inventory-adjustment',
          title: 'adjustment',
          type: 'item',
          url: '/inventory/adjustment',
          permissions: ['INVENTORY_VIEW']
        }
      ]
    },
    {
      id: 'quality-control',
      title: '9. QC',
      type: 'collapse',
      icon: icons.BugOutlined,
      url: '/quality-control',
      children: [
        {
          id: 'quality-control-reports',
          title: 'reports',
          type: 'item',
          url: '/quality-control/reports',
          permissions: ['QC_VIEW']
        },
        {
          id: 'quality-control-inquiry',
          title: 'inquiry',
          type: 'item',
          url: '/quality-control/inquiry'
        }
      ]
    },
    {
      id: 'payment-request',
      title: '10. payment-request',
      type: 'item',
      icon: icons.RadarChartOutlined,
      url: '/payment-request',
      permissions: ['PAYMENT_REQUEST_VIEW']
    }
  ]
};

export default contracts;
