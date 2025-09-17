import { useState, useEffect } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import dashboard from 'menu-items/dashboard';

import useConfig from 'hooks/useConfig';
import useRoleBasedMenu from 'hooks/useRoleBasedMenu';
import { HORIZONTAL_MAX_ITEM, MenuOrientation } from 'config';
import { useGetMenuMaster } from 'api/menu';

// types
import { NavItemType } from 'types/menu';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const [selectedID, setSelectedID] = useState<string | undefined>('');
  const [selectedItems, setSelectedItems] = useState<string | undefined>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  useEffect(() => {
    try {
      const baseItems = menuItem?.items ? [...menuItem.items] : [];

      if (dashboard?.id) {
        const finalMenuItems = [dashboard, ...baseItems];
        setMenuItems({ items: finalMenuItems });
      } else {
        setMenuItems({ items: baseItems });
      }
    } catch {
      // console.warn('Error setting up menu items:', error);
      setMenuItems({ items: menuItem?.items ? [...menuItem.items] : [] });
    }
  }, []); // No dependencies needed since we're using hardcoded data

  // Apply role-based filtering
  const filteredMenuItems = useRoleBasedMenu(menuItems);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = filteredMenuItems.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  //  first it checks menu item is more than giving HORIZONTAL_MAX_ITEM after that get lastItemId by giving horizontal max
  // item and it sets horizontal menu by giving lastItemIndex
  if (lastItem && lastItem < filteredMenuItems.items.length) {
    lastItemId = filteredMenuItems.items[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = filteredMenuItems.items.slice(lastItem - 1, filteredMenuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navGroups = filteredMenuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && isHorizontal) {
          return (
            <List key={item.id ?? `navitem-${index}`} {...(isHorizontal && { sx: { mt: 0.5 } })}>
              <NavItem key={item.id ?? `navitem-child-${index}`} item={item} level={1} isParents />
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id ?? `navgroup-${index}`}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedID={selectedID}
            selectedItems={selectedItems}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );

      default:
        return (
          <Typography key={item.id ?? `typography-${index}`} variant="h6" color="error" align="center">
            {/* Invalid menu item */}
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
}
