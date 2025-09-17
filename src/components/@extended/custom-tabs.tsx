import { Tabs } from '@mui/material';
import { ComponentProps, Fragment, ReactNode, useState } from 'react';
import Tab from '@mui/material/Tab';
import { stringHelper } from 'utils';

export type CustomTabItemProps = {
  value: string;
  component: ReactNode;
  label?: string;
  disabled?: boolean;
  icon?: string;
};

export type CustomTabProps = {
  tabs: CustomTabItemProps[];
  defaultTab: string;
  slotProps?: {
    tabs?: Omit<ComponentProps<typeof Tabs>, 'value' | 'onChange'>;
    tab?: Omit<ComponentProps<typeof Tab>, 'value' | 'label' | 'icon'>;
  };
};

const CustomTabs = ({ tabs, defaultTab, slotProps }: CustomTabProps) => {
  const [currentTab, onChangeTab] = useState<string>(defaultTab);

  return (
    <>
      <Tabs
        {...slotProps?.tabs}
        sx={{
          mb: 2,
          ...(slotProps?.tabs?.sx || {})
        }}
        value={currentTab}
        onChange={(_, newValue) => onChangeTab(newValue)}
      >
        {tabs.map((tab) => (
          <Tab
            {...slotProps?.tab}
            key={`header-custom-tab-${tab.value}`}
            disabled={tab.disabled}
            icon={tab.icon}
            label={tab.label || stringHelper.insertWhitespacePascal(tab.value.toString())}
            value={tab.value}
          />
        ))}
      </Tabs>

      {tabs.map(({ value, component: Component }) => (
        <Fragment key={`content-custom-tab-${value}`}>
          {value?.toString()?.toUpperCase() === `${currentTab}`.toUpperCase() && Component}
        </Fragment>
      ))}
    </>
  );
};

export default CustomTabs;
