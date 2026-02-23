import { DateRangePicker } from "@/components/DateRangePicker";
import { Header } from "@/components/Header";
import { OhlcvLightweightChart } from "@/components/OhlcvLightweightChart";
import { useOhlcvFileBrowser } from "@/hooks/useOhlcvFileBrowser";
import { useSeedOhlcv } from "@/hooks/useSeedOhlcv";
import { useTwelveDataImport } from "@/hooks/useTwelveDataImport";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import { SUPPORTED_SYMBOLS } from "shared";

export function AdminPage() {
  const {
    files,
    filesLoading,
    filesError,
    selectedFile,
    setSelectedFile,
    rows,
    contentLoading,
    contentError,
    refreshFiles,
    loadSelectedFile,
  } = useOhlcvFileBrowser();
  const {
    loading: seedLoading,
    result: seedResult,
    error: seedError,
    run: onSeedClick,
  } = useSeedOhlcv({ onSuccess: refreshFiles });
  const {
    symbol: tdSymbol,
    setSymbol: setTdSymbol,
    range: tdRange,
    setRange: setTdRange,
    loading: tdLoading,
    result: tdResult,
    error: tdError,
    run: onImportTwelveDataClick,
  } = useTwelveDataImport({ onSuccess: refreshFiles });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 0% 0%, #1d2d48 0%, #111620 45%, #090b10 100%)",
        color: "#f5f7fb",
        fontFamily:
          '"Avenir Next", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
      }}
    >
      <Header />

      <Box component="main" sx={{ maxWidth: 1040, mx: "auto", p: 2.5 }}>
        <Typography variant="h4" sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>
          管理画面
        </Typography>
        <Typography sx={{ opacity: 0.78, mb: 2 }}>
          OHLCVデータ運用とバックエンド状態を確認するためのルートです。
        </Typography>

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <AdminCard
            title="Data Import"
            note="テスト用OHLCVをR2バケットへ投入できます。"
          >
            <Button
              type="button"
              onClick={onSeedClick}
              disabled={seedLoading}
              variant="contained"
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#2f78ff",
                "&:hover": { bgcolor: "#2467e0" },
              }}
            >
              {seedLoading ? "投入中..." : "テストOHLCVを投入"}
            </Button>
            {seedResult && (
              <InlineAlert severity="success">{seedResult}</InlineAlert>
            )}
            {seedError && (
              <InlineAlert severity="error">{seedError}</InlineAlert>
            )}
          </AdminCard>

          <AdminCard
            title="TwelveData Import"
            note="銘柄名と日付を指定して TwelveData API からOHLCVを取込みます。"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 180px" },
                gap: 1,
              }}
            >
              <FormControl size="small" fullWidth>
                <Select
                  value={tdSymbol}
                  onChange={(event) =>
                    setTdSymbol(
                      event.target.value as (typeof SUPPORTED_SYMBOLS)[number],
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: { bgcolor: "#101722", color: "#f5f7fb" },
                    },
                  }}
                  sx={darkSelectSx}
                >
                  {SUPPORTED_SYMBOLS.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateRangePicker value={tdRange} onChange={setTdRange} />
            </Box>
            <Button
              type="button"
              onClick={onImportTwelveDataClick}
              disabled={tdLoading}
              variant="contained"
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#0d9f6e",
                "&:hover": { bgcolor: "#0b895f" },
              }}
            >
              {tdLoading ? "取込中..." : "TwelveData実行"}
            </Button>
            {tdResult && (
              <InlineAlert severity="success">{tdResult}</InlineAlert>
            )}
            {tdError && <InlineAlert severity="error">{tdError}</InlineAlert>}
          </AdminCard>

          <AdminCard
            title="Storage Browser"
            note="バケット内ファイルを選んでOHLCVを表示できます。"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedFile}
                  onChange={(event) => setSelectedFile(event.target.value)}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: { bgcolor: "#101722", color: "#f5f7fb" },
                    },
                  }}
                  sx={darkSelectSx}
                >
                  {files.length === 0 && (
                    <MenuItem value="">ファイルなし</MenuItem>
                  )}
                  {files.map((file) => (
                    <MenuItem key={file} value={file}>
                      {file}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="button"
                onClick={refreshFiles}
                disabled={filesLoading}
                variant="outlined"
                sx={mutedButtonSx}
              >
                更新
              </Button>
              <Button
                type="button"
                onClick={loadSelectedFile}
                disabled={!selectedFile || contentLoading}
                variant="contained"
                sx={{ bgcolor: "#2f78ff", "&:hover": { bgcolor: "#2467e0" } }}
              >
                {contentLoading ? "読込中..." : "表示"}
              </Button>
            </Stack>
            <Typography sx={{ fontSize: 13, opacity: 0.7, mt: 0.5 }}>
              bucket: `OHLCV_BUCKET`
            </Typography>
            {filesError && (
              <InlineAlert severity="error">{filesError}</InlineAlert>
            )}
            {contentError && (
              <InlineAlert severity="error">{contentError}</InlineAlert>
            )}
          </AdminCard>
        </Box>

        <AdminCard
          title="OHLCV Chart"
          note={
            <>
              選択中ファイル: {selectedFile || "なし"} / データ件数:{" "}
              {rows.length}
            </>
          }
          sx={{ mt: 1.5 }}
        >
          <Box>
            <OhlcvLightweightChart rows={rows} />
          </Box>
        </AdminCard>
      </Box>
    </Box>
  );
}

function AdminCard({
  title,
  note,
  children,
  sx,
}: {
  title: string;
  note: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 1.75,
        color: "#f5f7fb",
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.25}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>{note}</Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function InlineAlert({
  severity,
  children,
}: {
  severity: "success" | "error";
  children: ReactNode;
}) {
  const isSuccess = severity === "success";
  return (
    <Alert
      severity={severity}
      variant="outlined"
      sx={{
        py: 0.25,
        fontSize: 13,
        color: isSuccess ? "#9df5bf" : "#ffb6b6",
        borderColor: isSuccess
          ? "rgba(157, 245, 191, 0.35)"
          : "rgba(255, 182, 182, 0.35)",
        bgcolor: isSuccess
          ? "rgba(29, 120, 74, 0.12)"
          : "rgba(162, 59, 59, 0.12)",
        "& .MuiAlert-icon": {
          color: isSuccess ? "#9df5bf" : "#ffb6b6",
        },
      }}
    >
      {children}
    </Alert>
  );
}

const darkSelectSx = {
  color: "#f5f7fb",
  bgcolor: "rgba(0, 0, 0, 0.35)",
  borderRadius: 1,
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.18)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.28)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#90caf9",
  },
  ".MuiSvgIcon-root": { color: "#f5f7fb" },
} as const;

const mutedButtonSx = {
  color: "#fff",
  borderColor: "rgba(255,255,255,0.2)",
  bgcolor: "#1f3552",
  minWidth: 0,
  "&:hover": {
    borderColor: "rgba(255,255,255,0.3)",
    bgcolor: "#274265",
  },
} as const;
