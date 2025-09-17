import { ReactElement, useEffect, useState } from 'react';
import { data, Link, useLocation, useParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';

// third-party
import { FormattedMessage, useIntl } from 'react-intl';

// project imports
import MainCard from 'components/MainCard';
import navigation from 'menu-items';
import { ThemeDirection } from 'config';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import HomeFilled from '@ant-design/icons/HomeFilled';

// types
import { OverrideIcon } from 'types/root';
import { NavItemType, NavType } from 'types/menu';

interface BreadcrumbLinkProps {
  title: string;
  to?: string;
  icon?: string | OverrideIcon;
  disabled?: boolean;
}

// ==============================|| BREADCRUMBS ||============================== //

interface Props {
  card?: boolean;
  custom?: boolean;
  divider?: boolean;
  heading?: string;
  icon?: boolean;
  icons?: boolean;
  links?: BreadcrumbLinkProps[];
  maxItems?: number;
  rightAlign?: boolean;
  separator?: OverrideIcon;
  title?: boolean;
  titleBottom?: boolean;
  sx?: BreadcrumbsProps['sx'];
  translate?: boolean;
}

export default function Breadcrumbs({
  card = false,
  custom = false,
  divider = false,
  translate = true,
  heading,
  icon,
  icons,
  links,
  maxItems,
  rightAlign,
  separator,
  title = true,
  titleBottom = true,
  sx,
  ...others
}: Props) {
  const theme = useTheme();
  const location = useLocation();
  const { id } = useParams();
  const intl = useIntl();

  const [main, setMain] = useState<NavItemType | undefined>();
  const [item, setItem] = useState<NavItemType>();

  const iconSX = {
    marginRight: theme.direction === ThemeDirection.RTL ? 0 : theme.spacing(0.75),
    marginLeft: theme.direction === ThemeDirection.RTL ? theme.spacing(0.75) : 0,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  let customLocation = location.pathname;

  // only used for component demo breadcrumbs
  if (customLocation.includes('/components-overview/breadcrumbs')) {
    customLocation = '/apps/customer/customer-card';
  }
  if (customLocation === '/sea-customs') {
    customLocation = '/sea-customs/list';
  }
  useEffect(() => {
    navigation?.items?.map((menu: NavItemType) => {
      if (menu.type && menu.type === 'group') {
        if (menu?.url && menu.url === customLocation) {
          setMain(menu);
          setItem(menu);
        } else {
          getCollapse(menu as { children: NavItemType[]; type?: NavType });
        }
      }
      return false;
    });
  });

  // set active item state
  const getCollapse = (menu: NavItemType) => {
    if (!custom && menu.children) {
      menu.children.filter((collapse: NavItemType) => {
        if (collapse.type && collapse.type === 'collapse') {
          getCollapse(collapse as { children: NavItemType[]; type?: NavType });
          if (collapse.url === customLocation) {
            setMain(collapse);
            setItem(collapse);
          }
        } else if (collapse.type && (collapse.type === 'item' || collapse.type === 'hidden')) {
          if (customLocation === (id ? collapse.url + `/${String(id)}` : collapse.url)) {
            setMain(menu);
            setItem(collapse);
          }
        }
        return false;
      });
    }
  };

  // item separator
  const SeparatorIcon = separator!;
  const separatorIcon = separator ? <SeparatorIcon style={{ fontSize: '0.75rem', marginTop: 2 }} /> : '/';

  let mainContent;
  let itemContent;
  let breadcrumbContent: ReactElement = <Typography />;
  let itemTitle: NavItemType['title'] = '';
  let CollapseIcon;
  let ItemIcon;
  const mainList = main?.children?.find((item) => ['list' /* 'ship-transport', 'road-transport' */].includes(item.title as string));

  // collapse item
  if (main && main.type === 'collapse' && !main.breadcrumbs) {
    CollapseIcon = main.icon ? main.icon : ApartmentOutlined;
    mainContent = (
      <Typography
        {...((mainList as any)?.url && { component: Link, to: (mainList as any)?.url as string })}
        variant={window.location.pathname === main.url ? 'subtitle1' : 'h6'}
        sx={{ textDecoration: 'none' }}
        color={window.location.pathname === main.url ? 'text.primary' : 'text.secondary'}
      >
        {icons && <CollapseIcon style={iconSX} />}
        <FormattedMessage id={main?.title as string} />
      </Typography>
    );

    if (!!custom) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'inherit', backgroundImage: 'none', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            <Grid>
              <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
                <Typography component={Link} to="/" color="text.secondary" variant="h6" sx={{ textDecoration: 'none' }}>
                  {icons && <HomeOutlined style={iconSX} />}
                  {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
                  {(!icon || icons) && <FormattedMessage id="home" />}
                </Typography>
                {mainContent}
              </MuiBreadcrumbs>
            </Grid>
            {title && titleBottom && (
              <Grid sx={{ mt: card === false ? 0.25 : 1 }}>
                <Typography variant="h2">
                  <FormattedMessage id={main.title as string} />
                </Typography>
              </Grid>
            )}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  // items
  if ((item && item.type === 'item') || item?.type === 'hidden' || (item?.type === 'group' && item?.url) || custom) {
    itemTitle = item?.title;

    ItemIcon = item?.icon ? item.icon : ApartmentOutlined;
    itemContent = (
      <Typography variant="subtitle1" color="text.primary">
        {icons && <ItemIcon style={iconSX} />}
        <FormattedMessage id={itemTitle as string} />{' '}
        {location.state?.code && intl.formatMessage({ id: 'code_label' }).toLowerCase() + ' ' + location.state?.code}
      </Typography>
    );

    let tempContent = (
      <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
        <Typography component={Link} to="/" color="text.secondary" variant="h6" sx={{ textDecoration: 'none' }}>
          {icons && <HomeOutlined style={iconSX} />}
          {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
          {(!icon || icons) && <FormattedMessage id="home" />}
        </Typography>
        {mainContent}
        {itemContent}
      </MuiBreadcrumbs>
    );

    if (custom && links && links?.length > 0) {
      tempContent = (
        <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
          {links?.map((link: BreadcrumbLinkProps, index: number) => {
            CollapseIcon = link.icon ? link.icon : ApartmentOutlined;

            return (
              <Typography
                key={index}
                {...(link.to && { component: Link, to: link.to })}
                variant={!link.to ? 'subtitle1' : 'h6'}
                sx={{ textDecoration: 'none' }}
                color={!link.to ? 'text.primary' : 'text.secondary'}
                {...(link.disabled && { variant: 'h6', color: 'text.secondary' })}
              >
                {link.icon && <CollapseIcon style={iconSX} />}
                {translate ? <FormattedMessage id={link.title as string} /> : link.title}
              </Typography>
            );
          })}
        </MuiBreadcrumbs>
      );
    }

    // main
    if (item?.breadcrumbs !== false || custom) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'inherit', backgroundImage: 'none', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            {title && !titleBottom && (
              <Grid>
                <Typography variant="h2">
                  {translate ? (
                    <FormattedMessage id={custom ? heading : (item?.title as string)} />
                  ) : custom ? (
                    heading
                  ) : (
                    (item?.title as string)
                  )}
                </Typography>
              </Grid>
            )}
            <Grid>{tempContent}</Grid>
            {title && titleBottom && (
              <Grid sx={{ mt: card === false ? 0.25 : 1 }}>
                <Typography variant="h2">
                  <>
                    {translate ? (
                      <>
                        {location.state?.code ? (
                          `${intl.formatMessage({ id: 'information_detail_code' }, { value: location.state?.code })}`
                        ) : (
                          <FormattedMessage id={custom ? heading : (item?.title as string)} />
                        )}
                      </>
                    ) : custom ? (
                      heading
                    ) : (
                      (item?.title as string)
                    )}
                  </>
                </Typography>
              </Grid>
            )}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  return breadcrumbContent;
}
