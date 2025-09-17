// project imports
import contracts from './contracts';
import masters from './master';
import widget from './widget';

// types
import { NavItemType } from 'types/menu';
import requests from './request';
import systems from './system';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  // items: [widget, applications, formsTables, chartsMap, samplePage, pages, other]
  items: [widget, contracts, masters, systems, requests]
};

export default menuItems;
