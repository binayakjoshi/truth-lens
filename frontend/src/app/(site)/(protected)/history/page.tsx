import { cookies } from "next/headers";
import { Box, Container, Stack, Typography } from "@mui/material";
import AnalysisHistoryCard from "@/components/history/history-card";
import HistoryPagination from "@/components/history/pagination";
import { AnalysisHistoryResponse } from "@/types/type";

async function getAnalysisHistory(
  page: number,
  limit: number,
): Promise<AnalysisHistoryResponse | null> {
  const cookieStore = await cookies();
  try {
    const res = await fetch(
      `${process.env.PROXY_API_URL}/api/analysis/?page=${page}&limit=${limit}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      },
    );
    if (res.ok) {
      const resData = await res.json();
      return resData.data;
    }
  } catch {
    return null;
  }
  return null;
}

interface HistoryPageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const limit = Number(params.limit) > 0 ? Number(params.limit) : 9;
  const history = await getAnalysisHistory(page, limit);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6, flex: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-end" },
            mb: 4,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "0.12em",
                color: "text.secondary",
                fontSize: "0.7rem",
                mb: 0.5,
              }}
            >
              Detection log
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Analysis History
            </Typography>
          </Box>
          {history && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                color: "text.secondary",
                fontSize: "0.8rem",
              }}
            >
              {history.analysisHistories.length} of{" "}
              {history.lastPage * history.limit} results · page {history.page}/
              {history.lastPage}
            </Typography>
          )}
        </Stack>

        {!history || history.analysisHistories.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No analysis history found yet.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: 2,
              }}
            >
              {history.analysisHistories.map((item) => (
                <AnalysisHistoryCard key={item.id} item={item} />
              ))}
            </Box>
            <Box sx={{ mt: 5 }}>
              <HistoryPagination
                page={history.page}
                lastPage={history.lastPage}
                limit={history.limit}
              />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
