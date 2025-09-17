import { ReactNode } from 'react';

// material-ui
import { ChipProps } from '@mui/material/Chip';

// project imports
import { GenericCardProps } from './root';
import { NavActionType } from 'config';
import { ScreenPermission } from '../services/authority';

// ==============================|| MENU TYPES ||============================== //

type NavActionProps = {
  type: NavActionType;
  label: string;
  function?: any;
  url?: string;
  target?: boolean;
  icon: GenericCardProps['iconPrimary'] | string;
};

export type NavType = 'group' | 'item' | 'hidden' | 'collapse' | undefined;

export type NavItemType = {
  breadcrumbs?: boolean;
  caption?: ReactNode | string;
  children?: NavItemType[];
  elements?: NavItemType[];
  chip?: ChipProps;
  color?: 'primary' | 'secondary' | 'default' | undefined;
  disabled?: boolean;
  external?: boolean;
  isDropdown?: boolean;
  icon?: GenericCardProps['iconPrimary'] | string;
  id?: string;
  link?: string;
  search?: string;
  target?: boolean;
  title?: ReactNode | string;
  type?: NavType;
  url?: string | undefined;
  actions?: NavActionProps[];
  permissions?: ScreenPermission[];
};

export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

export type MenuProps = {
  /**
   * Indicate if dashboard layout menu open or not
   */
  isDashboardDrawerOpened: boolean;

  /**
   * Indicate if component layout menu open or not
   */
  isComponentDrawerOpened: boolean;
};
