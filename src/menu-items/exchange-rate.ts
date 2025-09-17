// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DollarOutlined } from '@ant-design/icons';

// type
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - EXCHANGE RATE ||============================== //

const exchangeRate: NavItemType = {
  id: 'exchange-rate',
  title: 'Tỷ giá',
  type: 'collapse',
  icon: DollarOutlined,
  children: [
    {
      id: 'exchange-rate-list',
      title: 'Danh sách tỷ giá',
      type: 'item',
      url: '/master/exchange-rate',
      breadcrumbs: false,

    },
    {
      id: 'exchange-rate-create',
      title: 'Tạo tỷ giá',
      type: 'item',
      url: '/master/exchange-rate/create',
      breadcrumbs: false
    }
  ]
};

export default exchangeRate;
