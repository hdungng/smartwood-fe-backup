// project imports

// assets
import { AppstoreAddOutlined, CodepenCircleOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
// type
import CodepenOutlined from '@ant-design/icons/lib/icons/CodepenOutlined';
import { NavItemType } from 'types/menu';
import { routing } from '../routes/routing';

// icons
const icons = {
  CodepenCircleOutlined,
  CodepenOutlined,
  AppstoreAddOutlined,
  UserOutlined,
  SafetyCertificateOutlined
};

// ==============================|| MENU ITEMS - systems ||============================== //

const systems: NavItemType = {
  id: 'group-systems',
  title: 'system-management',
  icon: icons.AppstoreAddOutlined,
  type: 'group',
  children: [
    {
      id: 'authority',
      title: 'authority',
      type: 'collapse',
      icon: icons.SafetyCertificateOutlined,
      children: [
        {
          id: 'user-permission-management',
          title: 'Phân quyền người dùng',
          type: 'item',
          url: routing.system.authority.permission,
          permissions: ['PERMISSION_VIEW']
        },
        {
          id: 'role-management',
          title: 'Vai trò',
          type: 'item',
          url: routing.system.authority.role,
          permissions: ['ROLE_VIEW']
        },

      ]
    },
    {
      id: 'configuration-management',
      title: 'configuration-management',
      type: 'item',
      url: '/system/config',
      icon: icons.CodepenCircleOutlined,
      permissions: ['CODE_VIEW']
    }
  ]
};

export default systems;
