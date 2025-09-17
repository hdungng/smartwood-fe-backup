import { Box, Button, Chip, Grid, TextField } from '@mui/material';
import { useEffect, useMemo } from 'react';
import ReactTable from 'common/tables/BasicTable';
import { ColumnDef } from '@tanstack/react-table';
import { ApprovalRequest } from 'types/contracts/purchase/logistic';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionCreateApproval,
  actionFetchApprovalByPCPackingPlanID,
  logisticSelector,
  setApproval,
  setApprovals,
  TLogisticState
} from 'redux/Logistic';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

const ApprovalSection = () => {
  const dispatch = useDispatch();
  const logistic: TLogisticState = useSelector(logisticSelector);
  const intl = useIntl();

  const refresh = () => {
    if (logistic.purchaseContractPackingPlan && logistic.purchaseContractPackingPlan.id > -1) {
      dispatch(
        actionFetchApprovalByPCPackingPlanID({
          PCPackingPlanID: logistic.purchaseContractPackingPlan.id
        })
      );
    } else {
      dispatch(setApprovals([]));
    }
  };

  useEffect(() => {
    refresh();
  }, [logistic.purchaseContractPackingPlan]);

  const handleApprove = (status: string) => {
    if (logistic.purchaseContractPackingPlan && logistic.purchaseContractPackingPlan.id > -1) {
      dispatch(
        actionCreateApproval({
          lastUpdatedProgram: moment().toISOString(),
          requestType: 'PACKING_PLAN',
          referId: logistic.purchaseContractPackingPlan.id,
          requesterId: 1,
          approverId: 1,
          approvalStatus: status,
          requestDate: moment().toISOString(),
          approvalDate: moment().toISOString(),
          comments: logistic.approval.comments
        })
      );
    }

    if (logistic.success === true && isEmpty(logistic.error)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }

    if (logistic.success === false && !isEmpty(logistic.error)) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 2500,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
    refresh();
  };

  const columns = useMemo<ColumnDef<ApprovalRequest>[]>(
    () => [
      {
        header: 'Số hợp đồng',
        accessorKey: 'code'
      },
      {
        header: 'Ngày duyệt',
        accessorKey: 'approvalDate'
      },
      {
        header: 'Trạng thái',
        accessorKey: 'approvalStatus',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Yêu cầu phê duyệt':
              return <Chip color="primary" label="Chưa duyệt" size="small" variant="light" />;
            case 'Phê duyệt':
              return <Chip color="success" label="Phê duyệt" size="small" variant="light" />;
            case 'Từ chối':
              return <Chip color="error" label="Từ chối" size="small" variant="light" />;
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Ghi chú',
        accessorKey: 'note'
      }
    ],
    []
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Ghi chú"
            value={logistic.approval?.comments}
            onChange={(e) => {
              dispatch(
                setApproval({
                  ...logistic.approval,
                  comments: e.target.value
                })
              );
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={() => handleApprove('Chưa duyệt')}>
              Yêu cầu phê duyệt
            </Button>
            <Button variant="contained" color="success" onClick={() => handleApprove('Phê duyệt')}>
              Phê duyệt
            </Button>
            <Button variant="contained" color="error" onClick={() => handleApprove('Từ chối')}>
              Từ chối
            </Button>
          </Box>
        </Grid>
      </Grid>
      <ReactTable columns={columns} data={!isEmpty(logistic.approvals) ? logistic.approvals : []} />
    </Box>
  );
};

export default ApprovalSection;
