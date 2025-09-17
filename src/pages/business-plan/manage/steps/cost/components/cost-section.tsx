import Typography from '@mui/material/Typography';
import Accordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import AccordionDetails, { AccordionDetailsProps } from '@mui/material/AccordionDetails';
import React from 'react';

type CostSectionProps = {
  title: string;
  children?: React.ReactNode;
  slotProps?: {
    root?: AccordionProps;
    summary?: AccordionSummaryProps;
    details?: AccordionDetailsProps;
  };
};

const CostSection = ({ title, children, slotProps = {} }: CostSectionProps) => {
  return (
    <Accordion defaultExpanded {...slotProps?.root}>
      <AccordionSummary tabIndex={-1} expandIcon={null} {...slotProps?.summary} sx={{ py: 1, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom={false} sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          ...slotProps?.details?.sx
        }}
        {...slotProps?.details}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default CostSection;
