import { TableRow } from '@mui/material';
import {
  ActionCell,
  ActualWeightCell,
  CodeBookingCell,
  ContainerNumberCell,
  CoverageGoodTypeCell,
  CoverageQuantityCell,
  DeliveryCell,
  GoodCell,
  GoodPriceCell,
  GoodTypeCell,
  LoadingDateCell,
  RegionCell,
  SealNumberCell,
  SupplierCell,
  TransportPriceCell,
  TruckNumberCell,
  UnloadingPortCell
} from '../cells';
import React from 'react';
import { useInitializedRowWatcher } from '../hooks';

type Props = IndexProps & {
  canRemove: boolean;
  onRemove: VoidFunction;
  onAdd: VoidFunction;
};

const ActualTowingRow = ({ index, canRemove, onRemove, onAdd }: Props) => {
  useInitializedRowWatcher(index);

  return (
    <TableRow>
      <CodeBookingCell index={index} />

      <RegionCell index={index} />

      <SupplierCell index={index} />

      <GoodCell index={index} />

      <GoodTypeCell index={index} />

      <LoadingDateCell index={index} />

      <ActualWeightCell index={index} />

      <GoodPriceCell index={index} />

      <DeliveryCell index={index} />

      <TransportPriceCell index={index} />

      <UnloadingPortCell index={index} />

      <TruckNumberCell index={index} />

      <ContainerNumberCell index={index} />

      <SealNumberCell index={index} onAdd={onAdd} />

      <CoverageGoodTypeCell index={index} />

      <CoverageQuantityCell index={index} onAdd={onAdd} />

      <ActionCell index={index} onRemove={onRemove} canRemove={canRemove} />
    </TableRow>
  );
};

export default ActualTowingRow;
