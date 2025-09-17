// material-ui
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import { CSVLink } from 'react-csv';
import { Headers } from 'react-csv/lib/core';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { useIntl } from 'react-intl';

// ==============================|| CSV EXPORT ||============================== //

interface CSVExportProps {
  data: never[] | any[];
  filename: string;
  headers?: Headers;
}

export default function CSVExport({ data, filename, headers }: CSVExportProps) {
  const intl = useIntl();

  return (
    <CSVLink
      data={data}
      filename={filename}
      headers={headers}
      uFEFF={true} // Add UTF-8 BOM for proper Vietnamese text display
      enclosingCharacter={'"'} // Ensure proper text enclosure
      separator=";" // Explicit separator
    >
      <Tooltip title={intl.formatMessage({ id: 'csv_export_label' })}>
        <Box sx={{ color: 'text.secondary' }}>
          <DownloadOutlined
            style={{
              fontSize: '24px',
              marginTop: 4,
              marginRight: 4,
              marginLeft: 4
            }}
          />
        </Box>
      </Tooltip>
    </CSVLink>
  );
}
