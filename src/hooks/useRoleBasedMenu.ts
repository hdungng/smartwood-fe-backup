import { useState, useEffect } from 'react';

// project imports
import { useRole } from 'contexts/RoleContext';

// types
import { NavItemType } from 'types/menu';
import { ScreenPermission } from 'services/authority';

const filterMenuByRole = (items: NavItemType[], currentPermission: ScreenPermission[]): NavItemType[] => {
  if (currentPermission.length === 0 || !Array.isArray(items)) return [];

  return items.reduce((filtered: NavItemType[], item: NavItemType) => {
    if (!item) return filtered;

    const clonedItem = { ...item };

    // Check if this item should be shown based on role
    let shouldShow = true;

    if (!!item.id) {
      try {
        shouldShow = (item.permissions || []).some((permission) => currentPermission?.includes(permission));
      } catch (error) {
        console.warn('Error checking screen access:', error);
        shouldShow = false;
      }
    } else {
      // If no mapping, check if it's a dashboard-related item (show by default)
      if (
        (typeof item.id === 'string' && item.id.includes('dashboard')) ||
        (typeof item.title === 'string' && item.title.includes('dashboard'))
      ) {
        shouldShow = true;
      }
    }

    // For group items, always show if they have visible children
    if (item.type === 'group' || item.type === 'collapse') {
      if (Array.isArray(item.children)) {
        const filteredChildren = filterMenuByRole(item.children, currentPermission);
        if (filteredChildren.length > 0) {
          clonedItem.children = filteredChildren;
          filtered.push(clonedItem);
        }
      } else if (shouldShow) {
        // Group with no children but should show
        filtered.push(clonedItem);
      }
    } else if (shouldShow) {
      // For individual items, only show if role has access
      filtered.push(clonedItem);
    }

    return filtered;
  }, []);
};

// ==============================|| ROLE BASED MENU HOOK ||============================== //

export const useRoleBasedMenu = (originalMenuItems: { items: NavItemType[] }) => {
  const { currentPermission } = useRole();
  const [filteredMenuItems, setFilteredMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  useEffect(() => {
    if (currentPermission.length === 0) {
      setFilteredMenuItems({ items: [] });
      return;
    }

    if (!originalMenuItems || !Array.isArray(originalMenuItems.items)) {
      setFilteredMenuItems({ items: [] });
      return;
    }

    try {
      const filteredItems = filterMenuByRole(originalMenuItems.items, currentPermission);
      setFilteredMenuItems({ items: filteredItems });
    } catch {
      setFilteredMenuItems({ items: [] });
    }
  }, [currentPermission, originalMenuItems]);

  return filteredMenuItems;
};

export default useRoleBasedMenu;
