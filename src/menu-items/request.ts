// project imports

// assets
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';

// type
import { IdcardOutlined } from '@ant-design/icons';
import { NavItemType } from 'types/menu';

// icons
const icons = {
  AppstoreAddOutlined,
  IdcardOutlined
};

// ==============================|| MENU ITEMS - requests ||============================== //

const requests: NavItemType = {
  id: 'group-requests',
  title: 'request',
  icon: icons.AppstoreAddOutlined,
  type: 'group',
  children: [
    {
      id: 'stationery',
      title: 'stationery',
      type: 'collapse',
      icon: icons.IdcardOutlined,
      children: [
        {
          id: 'stationery-list',
          title: 'list',
          type: 'item',
          url: 'stationery/list',
          permissions: ['STATIONERY_VIEW']
        },
        {
          id: 'stationery-request',
          title: 'request',
          type: 'item',
          url: 'stationery/request',

        },
        {
          id: 'stationery-approve',
          title: 'approve',
          type: 'item',
          url: 'stationery/approve',
          permissions: ['STATIONERY_APPROVE']
        }
      ]
    }
    // {
    //   id: 'invoice',
    //   title: 'invoice',
    //   url: '/apps/invoice/dashboard',
    //   type: 'collapse',
    //   icon: icons.FileTextOutlined,
    //   breadcrumbs: false,
    //   children: [
    //   ]
    // }
  ]
};

export default requests;
