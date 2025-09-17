import React from 'react';
import { Box, Typography, Paper, Avatar, Stack } from '@mui/material';

interface Comment {
  id: number;
  content: string;
  author: string; // Changed to required field
  createdAt?: string;
  replyToAuthor?: string;
}

interface Props {
  comment: Comment;
}

const CommentComponent: React.FC<Props> = ({ comment }) => {
  const authorInitial = comment.author.charAt(0).toUpperCase() || 'U'; // Fallback to 'U' if author is empty

  // Log warning if author is empty
  if (!comment.author) {
    console.warn(`Comment ${comment.id} không có tên tác giả được cung cấp`);
  }

  const formatDateVN = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    const SS = String(d.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`;
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar>{authorInitial}</Avatar>
        <Box>
          <Typography variant="subtitle2">{comment.author || 'Unknown'}</Typography>
          {comment.replyToAuthor && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Trả lời {comment.replyToAuthor}
            </Typography>
          )}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {comment.content}
          </Typography>
          {comment.createdAt && (
            <Typography variant="caption" color="text.secondary">
              {formatDateVN(comment.createdAt)}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default CommentComponent;