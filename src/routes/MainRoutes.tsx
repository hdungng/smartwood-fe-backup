import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';

import { SimpleLayoutType } from 'config';
// import CashFlowManagement from 'pages/apps/accounting/cash-flow';
import AccountingDetails from 'pages/apps/accounting/details';
import AccountingList from 'pages/apps/accounting/list';
import ContractSellList from 'pages/apps/constracts/sell/list';
import ContractSellUpdateOrCreate from 'pages/apps/constracts/sell/UpdateOrCreate';
import WeighingSlipExport from 'pages/apps/constracts/sell/WeighingSlipExport';
import LogisticApprove from 'pages/apps/logistic/approve/LogisticApprove';
import LogisticForm from 'pages/apps/logistic/LogisticForm';
import LogisticTruck from 'pages/apps/logistic/truck/LogisticTruck';
import QCList from 'pages/apps/qc/list';
import QualityReportsList from 'pages/apps/qc/quality-reports-list';
import { CostCreate, CostEdit, CostListPage, CostView } from 'pages/master/cost';
import { CustomerCreate, CustomerEdit, CustomerList, CustomerView } from 'pages/master/customer';
import CustomerContract from 'pages/master/customer/Contract';
import ContractList from 'pages/master/customer/ContractList';
import ExchangeRateListPage, { ExchangeRateCreate, ExchangeRateEdit, ExchangeRateView } from 'pages/master/exchange-rate';
import { GoodCreate, GoodEdit, GoodList, GoodView } from 'pages/master/good';
import { SupplierCreate, SupplierEdit, SupplierList, SupplierView } from 'pages/master/supplier';
import UserCreate from 'pages/master/user/Create';
import UserEdit from 'pages/master/user/Edit';
import UserListPage from 'pages/master/user/List';
import UserView from 'pages/master/user/View';
import ExportControl from 'pages/qc/ExportControl';
import InquiryControl from 'pages/qc/InquiryControl';
import QualityControl from 'pages/qc/QualityControl';
import HistoryPayment from 'sections/constracts/purchase/steps-forms/payment/HistoryPayment';

// Price Management Page
import GoodSupplierCreate from 'pages/master/price-manager/Create';
import GoodSupplierEdit from 'pages/master/price-manager/Edit';
import GoodSupplierList from 'pages/master/price-manager/GoodSupplierList';

// New pages

import EditSaleContract from 'pages/apps/constracts/sell/EditSaleContract';
import ViewSaleContract from 'pages/apps/constracts/sell/ViewSaleContract';
import { ConfigCreate, ConfigEdit, ConfigList, ConfigView } from 'pages/config';
import ConfigDetailPage from 'pages/config/detail';
import InventoryAdjustment from 'pages/inventory/adjustment';
import InventoryImportExport from 'pages/inventory/import-export';
import { DeliveryTermView } from 'pages/master/delivery-term';
import DeliveryTermCreate from 'pages/master/delivery-term/Create';
import DeliveryTermEdit from 'pages/master/delivery-term/Edit';
import DeliveryTermList from 'pages/master/delivery-term/List';
import { ForwarderCreate, ForwarderEdit, ForwarderList, ForwarderView } from 'pages/master/forwarder';
import PaymentTermList, { PaymentTermCreate, PaymentTermEdit, PaymentTermView } from 'pages/master/payment-term';
import { ShippingLineCreate, ShippingLineEdit, ShippingLineList, ShippingLineView } from 'pages/master/shipping-line';
import ShippingUnitCreate from 'pages/master/shipping-unit/Create';
import ShippingUnitEdit from 'pages/master/shipping-unit/Edit';
import ShippingUnitListPage from 'pages/master/shipping-unit/List';
import ShippingUnitView from 'pages/master/shipping-unit/View';
import PaymentRequestApprove from 'pages/payment-request/Approve';
import PaymentRequestList from 'pages/payment-request/list';

import PaymentRequestUpdateOrCreate from 'pages/payment-request/UpdateOrCreate';
import sectionRoutes from './sections';
import CustomSeaList from 'pages/apps/sea-customs/list';
import { PermissionGuard } from 'components/guards';
// import ReportAddForm from 'pages/apps/qc/ReportAddForm';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const DashboardAnalytics = Loadable(lazy(() => import('pages/dashboard/analytics')));
const DashboardExecutive = Loadable(lazy(() => import('pages/dashboard/executive')));
const DashboardLogistic = Loadable(lazy(() => import('pages/dashboard/logistic')));
const DashboardDomestic = Loadable(lazy(() => import('pages/dashboard/domestic')));
const DashboardAccount = Loadable(lazy(() => import('pages/dashboard/account')));
const DashboardMarketOverview = Loadable(lazy(() => import('pages/dashboard/market-overview')));
const DashboardCustomers = Loadable(lazy(() => import('pages/dashboard/customers')));
const DashboardSuppliers = Loadable(lazy(() => import('pages/dashboard/suppliers')));
const DashboardOrderTracking = Loadable(lazy(() => import('pages/dashboard/order-tracking')));
const ToDoList = Loadable(lazy(() => import('pages/dashboard/todo-list')));
const DashboardRevenueSummary = Loadable(lazy(() => import('pages/dashboard/revenue-summary')));
const DashboardReceivables = Loadable(lazy(() => import('pages/dashboard/receivables')));
const DashboardCostSummary = Loadable(lazy(() => import('pages/dashboard/cost-summary')));
const DashboardUSDExchange = Loadable(lazy(() => import('pages/dashboard/usd-exchange')));

const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
const UserTabSettings = Loadable(lazy(() => import('sections/apps/profiles/user/TabSettings')));

const AccountProfile = Loadable(lazy(() => import('pages/apps/profiles/account')));
const AccountTabProfile = Loadable(lazy(() => import('sections/apps/profiles/account/TabProfile')));
const AccountTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/account/TabPersonal')));
const AccountTabAccount = Loadable(lazy(() => import('sections/apps/profiles/account/TabAccount')));
const AccountTabPassword = Loadable(lazy(() => import('sections/apps/profiles/account/TabPassword')));
const AccountTabRole = Loadable(lazy(() => import('sections/apps/profiles/account/TabRole')));
const AccountTabSettings = Loadable(lazy(() => import('sections/apps/profiles/account/TabSettings')));

// render - forms & tables
const AppOrderList = Loadable(lazy(() => import('pages/apps/order/order-list')));
const AppOrderCard = Loadable(lazy(() => import('pages/apps/order/order-card')));

const ReactTableBasic = Loadable(lazy(() => import('pages/tables/react-table/basic')));
const ReactDenseTable = Loadable(lazy(() => import('pages/tables/react-table/dense')));
const ReactTableSorting = Loadable(lazy(() => import('pages/tables/react-table/sorting')));
const ReactTableFiltering = Loadable(lazy(() => import('pages/tables/react-table/filtering')));
const ReactTableGrouping = Loadable(lazy(() => import('pages/tables/react-table/grouping')));
const ReactTablePagination = Loadable(lazy(() => import('pages/tables/react-table/pagination')));
const ReactTableRowSelection = Loadable(lazy(() => import('pages/tables/react-table/row-selection')));
const ReactTableExpanding = Loadable(lazy(() => import('pages/tables/react-table/expanding')));
const ReactTableEditable = Loadable(lazy(() => import('pages/tables/react-table/editable')));
const ReactTableDragDrop = Loadable(lazy(() => import('pages/tables/react-table/drag-drop')));
const ReactTableColumnVisibility = Loadable(lazy(() => import('pages/tables/react-table/column-visibility')));
const ReactTableColumnResizing = Loadable(lazy(() => import('pages/tables/react-table/column-resizing')));
const ReactTableStickyTable = Loadable(lazy(() => import('pages/tables/react-table/sticky')));
const ReactTableUmbrella = Loadable(lazy(() => import('pages/tables/react-table/umbrella')));
const ReactTableEmpty = Loadable(lazy(() => import('pages/tables/react-table/empty')));
const ReactTableVirtualized = Loadable(lazy(() => import('pages/tables/react-table/virtualized')));

// render - charts & map
const ChartApexchart = Loadable(lazy(() => import('pages/charts/apexchart')));
const ChartOrganization = Loadable(lazy(() => import('pages/charts/org-chart')));

// table routing
const MuiTableBasic = Loadable(lazy(() => import('pages/tables/mui-table/basic')));
const MuiTableDense = Loadable(lazy(() => import('pages/tables/mui-table/dense')));
const MuiTableEnhanced = Loadable(lazy(() => import('pages/tables/mui-table/enhanced')));
const MuiTableDatatable = Loadable(lazy(() => import('pages/tables/mui-table/datatable')));
const MuiTableCustom = Loadable(lazy(() => import('pages/tables/mui-table/custom')));
const MuiTableFixedHeader = Loadable(lazy(() => import('pages/tables/mui-table/fixed-header')));
const MuiTableCollapse = Loadable(lazy(() => import('pages/tables/mui-table/collapse')));

// pages routing
const AuthLogin = Loadable(lazy(() => import('pages/auth/jwt/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/jwt/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/jwt/forgot-password')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/jwt/reset-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/jwt/check-mail')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/jwt/code-verification')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));

const LogisticFormEdit = Loadable(lazy(() => import('pages/apps/logistic/LogisticFormEdit')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            },
            {
              path: 'analytics',
              element: <DashboardAnalytics />
            },
            {
              path: 'executive-board',
              element: <DashboardExecutive />
            },
            {
              path: 'accounting',
              element: <DashboardAccount />
            },
            {
              path: 'qc-domestic',
              element: <DashboardDomestic />
            },
            {
              path: 'qc-logistics',
              element: <DashboardLogistic />
            },
            {
              path: 'market-overview',
              element: <DashboardMarketOverview />
            },
            {
              path: 'customers',
              element: <DashboardCustomers />
            },
            {
              path: 'suppliers',
              element: <DashboardSuppliers />
            },
            {
              path: 'order-tracking',
              element: <DashboardOrderTracking />
            },
            {
              path: 'todo-list',
              element: <ToDoList />
            },
            {
              path: 'revenue-summary',
              element: <DashboardRevenueSummary />
            },
            {
              path: 'receivables',
              element: <DashboardReceivables />
            },
            {
              path: 'cost-summary',
              element: <DashboardCostSummary />
            },
            {
              path: 'usd-exchange',
              element: <DashboardUSDExchange />
            }
          ]
        },
        {
          path: 'accounting',
          children: [
            {
              path: '',
              element: <AccountingList />
            },

            {
              path: 'details/:id',
              element: <AccountingDetails />
            }
            // {
            //   path: 'cash-flow',
            //   element: <CashFlowManagement />
            // },
          ]
        },
        {
          path: 'apps',
          children: [
            {
              path: 'customer',
              children: [
                {
                  index: true,
                  element: <CustomerList />
                },
                {
                  path: 'contract',
                  element: <CustomerContract />
                },
                {
                  path: 'list',
                  element: <CustomerList />
                }
              ]
            },
            {
              path: 'profiles',
              children: [
                {
                  path: 'account',
                  element: <AccountProfile />,
                  children: [
                    {
                      path: 'basic',
                      element: <AccountTabProfile />
                    },
                    {
                      path: 'personal',
                      element: <AccountTabPersonal />
                    },
                    {
                      path: 'my-account',
                      element: <AccountTabAccount />
                    },
                    {
                      path: 'password',
                      element: <AccountTabPassword />
                    },
                    {
                      path: 'role',
                      element: <AccountTabRole />
                    },
                    {
                      path: 'settings',
                      element: <AccountTabSettings />
                    }
                  ]
                },
                {
                  path: 'user',
                  element: <UserProfile />,
                  children: [
                    {
                      path: 'personal',
                      element: <UserTabPersonal />
                    },
                    {
                      path: 'payment',
                      element: <UserTabPayment />
                    },
                    {
                      path: 'password',
                      element: <UserTabPassword />
                    },
                    {
                      path: 'settings',
                      element: <UserTabSettings />
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          path: 'tables',
          children: [
            {
              path: 'react-table',
              children: [
                {
                  path: 'basic',
                  element: <ReactTableBasic />
                },
                {
                  path: 'dense',
                  element: <ReactDenseTable />
                },
                {
                  path: 'sorting',
                  element: <ReactTableSorting />
                },
                {
                  path: 'filtering',
                  element: <ReactTableFiltering />
                },
                {
                  path: 'grouping',
                  element: <ReactTableGrouping />
                },
                {
                  path: 'pagination',
                  element: <ReactTablePagination />
                },
                {
                  path: 'row-selection',
                  element: <ReactTableRowSelection />
                },
                {
                  path: 'expanding',
                  element: <ReactTableExpanding />
                },
                {
                  path: 'editable',
                  element: <ReactTableEditable />
                },
                {
                  path: 'drag-drop',
                  element: <ReactTableDragDrop />
                },
                {
                  path: 'column-visibility',
                  element: <ReactTableColumnVisibility />
                },
                {
                  path: 'column-resizing',
                  element: <ReactTableColumnResizing />
                },
                {
                  path: 'sticky-table',
                  element: <ReactTableStickyTable />
                },
                {
                  path: 'umbrella',
                  element: <ReactTableUmbrella />
                },
                {
                  path: 'empty',
                  element: <ReactTableEmpty />
                },
                {
                  path: 'virtualized',
                  element: <ReactTableVirtualized />
                }
              ]
            },
            {
              path: 'mui-table',
              children: [
                {
                  path: 'basic',
                  element: <MuiTableBasic />
                },
                {
                  path: 'dense',
                  element: <MuiTableDense />
                },
                {
                  path: 'enhanced',
                  element: <MuiTableEnhanced />
                },
                {
                  path: 'datatable',
                  element: <MuiTableDatatable />
                },
                {
                  path: 'custom',
                  element: <MuiTableCustom />
                },
                {
                  path: 'fixed-header',
                  element: <MuiTableFixedHeader />
                },
                {
                  path: 'collapse',
                  element: <MuiTableCollapse />
                }
              ]
            }
          ]
        },
        {
          path: 'charts',
          children: [
            {
              path: 'apexchart',
              element: <ChartApexchart />
            },
            {
              path: 'org-chart',
              element: <ChartOrganization />
            }
          ]
        },
        {
          path: 'system',
          children: [
            {
              path: 'config',
              element: <ConfigList />
            },
            {
              path: 'config/create',
              element: <ConfigCreate />
            },
            {
              path: 'config/edit/:id',
              element: <ConfigEdit />
            },
            {
              path: 'config/view/:id',
              element: <ConfigView />
            }
          ]
        },
        {
          path: 'config',
          children: [
            {
              path: 'detail/:id',
              element: <ConfigDetailPage />
            }
          ]
        },
        {
          path: 'master',
          children: [
            {
              path: 'user',
              element: (
                <PermissionGuard permission="M_USER_VIEW">
                  <UserListPage />
                </PermissionGuard>
              )
            },
            {
              path: 'user/create',
              element: (
                <PermissionGuard permission="M_USER_CREATE">
                  <UserCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'user/edit/:id',
              element: (
                <PermissionGuard permission="M_USER_UPDATE">
                  <UserEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'user/view/:id',
              element: (
                <PermissionGuard permission="M_USER_VIEW">
                  <UserView />
                </PermissionGuard>
              )
            },
            {
              path: 'customer-contract',
              children: [
                {
                  path: '',
                  element: <ContractList />
                },
                {
                  path: 'create',
                  element: <CustomerContract />
                },
                {
                  path: 'edit/:id',
                  element: <CustomerContract />
                },
                {
                  path: 'view/:id',
                  element: <CustomerContract />
                }
              ]
            },
            {
              path: 'customer',
              element: (
                <PermissionGuard permission="M_CUSTOMER_VIEW">
                  <CustomerList />
                </PermissionGuard>
              )
            },
            {
              path: 'customer/create',
              element: (
                <PermissionGuard permission="M_CUSTOMER_CREATE">
                  <CustomerCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'customer/edit/:id',
              element: (
                <PermissionGuard permission="M_CUSTOMER_UPDATE">
                  <CustomerEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'customer/view/:id',
              element: (
                <PermissionGuard permission="M_CUSTOMER_VIEW">
                  <CustomerView />
                </PermissionGuard>
              )
            },
            {
              path: 'supplier',
              element: (
                <PermissionGuard permission="M_SUPPLIER_VIEW">
                  <SupplierList />
                </PermissionGuard>
              )
            },
            {
              path: 'supplier/create',
              element: (
                <PermissionGuard permission="M_SUPPLIER_CREATE">
                  <SupplierCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'supplier/edit/:id',
              element: (
                <PermissionGuard permission="M_SUPPLIER_UPDATE">
                  <SupplierEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'supplier/view/:id',
              element: (
                <PermissionGuard permission="M_SUPPLIER_VIEW">
                  <SupplierView />
                </PermissionGuard>
              )
            },
            {
              path: 'good',
              element: (
                <PermissionGuard permission="M_GOOD_VIEW">
                  <GoodList />
                </PermissionGuard>
              )
            },
            {
              path: 'good/create',
              element: (
                <PermissionGuard permission="M_GOOD_CREATE">
                  <GoodCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'good/edit/:id',
              element: (
                <PermissionGuard permission="M_GOOD_UPDATE">
                  <GoodEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'good/view/:id',
              element: (
                <PermissionGuard permission="M_GOOD_VIEW">
                  <GoodView />
                </PermissionGuard>
              )
            },
            {
              path: 'price',
              element: <h1>Price</h1>
            },
            {
              path: 'delivery-term',
              element: (
                <PermissionGuard permission="M_DELIVERY_TERM_VIEW">
                  <DeliveryTermList />
                </PermissionGuard>
              )
            },
            {
              path: 'delivery-term/create',
              element: (
                <PermissionGuard permission="M_DELIVERY_TERM_CREATE">
                  <DeliveryTermCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'delivery-term/edit/:id',
              element: (
                <PermissionGuard permission="M_DELIVERY_TERM_UPDATE">
                  <DeliveryTermEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'delivery-term/view/:id',
              element: (
                <PermissionGuard permission="M_DELIVERY_TERM_VIEW">
                  <DeliveryTermView />
                </PermissionGuard>
              )
            },
            {
              path: 'payment-term',
              element: (
                <PermissionGuard permission="M_PAYMENT_TERM_VIEW">
                  <PaymentTermList />
                </PermissionGuard>
              )
            },
            {
              path: 'payment-term/create',
              element: (
                <PermissionGuard permission="M_PAYMENT_TERM_CREATE">
                  <PaymentTermCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'payment-term/edit/:id',
              element: (
                <PermissionGuard permission="M_PAYMENT_TERM_UPDATE">
                  <PaymentTermEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'payment-term/view/:id',
              element: (
                <PermissionGuard permission="M_PAYMENT_TERM_VIEW">
                  <PaymentTermView />
                </PermissionGuard>
              )
            },
            {
              path: 'shipping-unit',
              element: (
                <PermissionGuard permission="M_SHIPPING_UNIT_VIEW">
                  <ShippingUnitListPage />
                </PermissionGuard>
              )
            },
            {
              path: 'shipping-unit/create',
              element: (
                <PermissionGuard permission="M_SHIPPING_UNIT_CREATE">
                  <ShippingUnitCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'shipping-unit/edit/:id',
              element: (
                <PermissionGuard permission="M_SHIPPING_UNIT_UPDATE">
                  <ShippingUnitEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'shipping-unit/view/:id',
              element: (
                <PermissionGuard permission="M_SHIPPING_UNIT_VIEW">
                  <ShippingUnitView />
                </PermissionGuard>
              )
            },
            {
              path: 'exchange-rate',
              element: <ExchangeRateListPage />
            },
            {
              path: 'exchange-rate/create',
              element: <ExchangeRateCreate />
            },
            {
              path: 'exchange-rate/edit/:id',
              element: <ExchangeRateEdit />
            },
            {
              path: 'exchange-rate/view/:id',
              element: <ExchangeRateView />
            },
            {
              path: 'documents',
              element: <h1>Documents</h1>
            },
            {
              path: 'logistics-cost',
              element: (
                <PermissionGuard permission="M_LOGISTICS_COST_VIEW">
                  <CostListPage />
                </PermissionGuard>
              )
            },
            {
              path: 'logistics-cost/create',
              element: (
                <PermissionGuard permission="M_LOGISTICS_COST_CREATE">
                  <CostCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'logistics-cost/edit/:id',
              element: (
                <PermissionGuard permission="M_LOGISTICS_COST_UPDATE">
                  <CostEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'logistics-cost/view/:id',
              element: (
                <PermissionGuard permission="M_LOGISTICS_COST_VIEW">
                  <CostView />
                </PermissionGuard>
              )
            },
            {
              path: 'forwarder',
              children: [
                {
                  index: true,
                  element: (
                    <PermissionGuard permission="M_FORWARDER_VIEW">
                      <ForwarderList />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'create',
                  element: (
                    <PermissionGuard permission="M_FORWARDER_CREATE">
                      <ForwarderCreate />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'edit/:id',
                  element: (
                    <PermissionGuard permission="M_FORWARDER_UPDATE">
                      <ForwarderEdit />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'view/:id',
                  element: (
                    <PermissionGuard permission="M_FORWARDER_VIEW">
                      <ForwarderView />
                    </PermissionGuard>
                  )
                }
              ]
            },
            {
              path: 'shipping-line',
              children: [
                {
                  index: true,
                  element: (
                    <PermissionGuard permission="M_SHIPPING_LINE_VIEW">
                      <ShippingLineList />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'create',
                  element: (
                    <PermissionGuard permission="M_SHIPPING_LINE_CREATE">
                      <ShippingLineCreate />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'edit/:id',
                  element: (
                    <PermissionGuard permission="M_SHIPPING_LINE_UPDATE">
                      <ShippingLineEdit />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'view/:id',
                  element: (
                    <PermissionGuard permission="M_SHIPPING_LINE_VIEW">
                      <ShippingLineView />
                    </PermissionGuard>
                  )
                }
              ]
            },
            {
              path: 'good-supplier',
              element: <GoodSupplierList />
            },
            {
              path: 'good-supplier/create',
              element: <GoodSupplierCreate />
            },
            {
              path: 'good-supplier/edit/:id',
              element: <GoodSupplierEdit />
            }
          ]
        },
        {
          path: 'contracts',
          children: [
            {
              path: 'sales',
              children: [
                {
                  path: 'list',
                  element: (
                    <PermissionGuard permission="SALE_CONTRACT_VIEW">
                      <ContractSellList />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'create',
                  element: (
                    <PermissionGuard permission="SALE_CONTRACT_CREATE">
                      <ContractSellUpdateOrCreate />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'edit/:id',
                  element: (
                    <PermissionGuard permission="SALE_CONTRACT_UPDATE">
                      <EditSaleContract />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'view/:id',
                  element: (
                    <PermissionGuard permission="SALE_CONTRACT_VIEW">
                      <ViewSaleContract />
                    </PermissionGuard>
                  )
                },
                {
                  path: 'weighing-slip-export',
                  element: <WeighingSlipExport />
                },
                {
                  path: 'weighing-slip-export/:id',
                  element: <WeighingSlipExport />
                }
              ]
            }
          ]
        },
        {
          path: 'logistics',
          children: [
            {
              path: 'ship',
              element: (
                <PermissionGuard permission="LOGISTICS_SHIP_VIEW">
                  <LogisticForm />
                </PermissionGuard>
              )
            },
            {
              path: 'ship-edit/:id',
              element: (
                <PermissionGuard permission="LOGISTICS_SHIP_UPDATE">
                  <LogisticFormEdit />
                </PermissionGuard>
              )
            },
            {
              path: 'truck',
              element: (
                <PermissionGuard permission="LOGISTICS_TRUCK_VIEW">
                  <LogisticTruck />
                </PermissionGuard>
              )
            },
            {
              path: 'approve',
              element: (
                <PermissionGuard permissions={['LOGISTICS_TRUCK_APPROVE', 'LOGISTICS_SHIP_VIEW']}>
                  <LogisticApprove />
                </PermissionGuard>
              )
            }
          ]
        },
        ...sectionRoutes,
        {
          path: 'orders',
          children: [
            {
              path: 'list',
              element: <AppOrderList />
            },
            {
              path: 'cards',
              element: <AppOrderCard />
            },
            {
              path: 'create',
              element: <h1>Create</h1>
            }
          ]
        },
        {
          path: 'inventory',
          children: [
            {
              path: 'import-export',
              element: <InventoryImportExport />
            },
            {
              path: 'adjustment',
              element: <InventoryAdjustment />
            }
          ]
        },
        {
          path: 'payment-request',
          children: [
            {
              path: '',
              element: (
                <PermissionGuard permission="PAYMENT_REQUEST_VIEW">
                  <PaymentRequestList />
                </PermissionGuard>
              )
            },
            {
              path: 'create',
              element: (
                <PermissionGuard permission="PAYMENT_REQUEST_CREATE">
                  <PaymentRequestUpdateOrCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'update/:id',
              element: (
                <PermissionGuard permission="PAYMENT_REQUEST_UPDATE">
                  <PaymentRequestUpdateOrCreate />
                </PermissionGuard>
              )
            },
            {
              path: 'approve/:id',
              element: (
                <PermissionGuard permission="PAYMENT_REQUEST_APPROVE">
                  <PaymentRequestApprove />
                </PermissionGuard>
              )
            }
          ]
        },

        {
          path: 'payment/history/:id',
          element: <HistoryPayment />
        },
        {
          path: 'sea-customs',
          children: [
            {
              path: 'list',
              element: <CustomSeaList />
            }
          ]
        },
        {
          path: 'quality-control',
          children: [
            {
              path: 'reports',
              element: <QCList />
            },
            {
              path: 'reports/:id',
              element: <QualityReportsList />
            },
            // {
            //   path: 'reports/add',
            //   element: <ReportAddForm />
            // },

            // {
            //   path: 'export-reports/:id',
            //   element: <ExportReportsList />
            // },
            {
              path: 'quality-reports',
              element: <QualityReportsList /> // Sử dụng cùng component QualityReportsList
            },
            {
              path: 'quality',
              element: <QualityControl />
            },
            {
              path: 'export',
              element: <ExportControl />
            },
            {
              path: 'inquiry',
              element: <InquiryControl />
            }
          ]
        },
        {
          path: 'stationery',
          element: <h1>Stationery</h1>,
          children: [
            {
              path: 'list',
              element: <h1>List</h1>
            },
            {
              path: 'request',
              element: <h1>Request</h1>
            },
            {
              path: 'approve',
              element: <h1>Approve</h1>
            }
          ]
        }
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    },
    {
      path: '/auth',
      element: <PagesLayout />,
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          path: 'contact-us',
          element: <AppContactUS />
        }
      ]
    }
  ]
};

export default MainRoutes;
