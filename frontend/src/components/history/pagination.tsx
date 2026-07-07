import { Box, Typography } from "@mui/material";

import LinkButton from "@/components/custom-elements/link-button";

interface HistoryPaginationProps {
  page: number;
  lastPage: number;
  limit: number;
  view: "list" | "grid";
}

export default function HistoryPagination({
  page,
  lastPage,
  limit,
  view,
}: HistoryPaginationProps) {
  const hasPrev = page > 1;
  const hasNext = page < lastPage;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 5,
      }}
    >
      <LinkButton
        href={`/history?page=${page - 1}&limit=${limit}&view=${view}`}
        variant="outlined"
        size="small"
        disabled={!hasPrev}
      >
        Previous
      </LinkButton>

      <Typography variant="body2" color="text.secondary">
        Page {page} of {lastPage}
      </Typography>

      <LinkButton
        href={`/history?page=${page + 1}&limit=${limit}&view=${view}`}
        variant="outlined"
        size="small"
        disabled={!hasNext}
      >
        Next
      </LinkButton>
    </Box>
  );
}
