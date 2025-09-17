import { Typography } from "@mui/material";

export const EllipsisText = ({ text, maxWidth = 400, ...props }: { text: string; maxWidth?: number;[key: string]: any }) => (
  <Typography
    {...props}
    sx={{
      maxWidth: `${maxWidth}px`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-block',
      ...props.sx
    }}
    title={text}
  >
    {text}
  </Typography>
);