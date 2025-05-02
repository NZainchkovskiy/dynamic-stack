import "./App.css";
import { DynamicHorizontalStack } from "./components/DynamicHorizontalStack";
import { Box, Stack, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

function App() {
  const items = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    content: (
      <Button variant="contained" color="primary" startIcon={<HomeIcon />} sx={{ width: 150, textAlign: "center" }}>
        Item {i + 1}
      </Button>
    ),
  }));
  return (
    <Stack
      direction="row"
      sx={{
        width: "calc(100vw - 40px)",
        m: 2,
        height: "100px",
        border: 1,
        alignItems: "center",
        gap: 2,
      }}
    >
      <Stack direction="row">
        <Box sx={{ whiteSpace: "nowrap" }}>Some text</Box>
        <Box sx={{ whiteSpace: "nowrap" }}>Some text2</Box>
      </Stack>
      <Box flexGrow={1} sx={{ overflow: "hidden" }}>
        <DynamicHorizontalStack items={items} gap={8} />
      </Box>
      <Stack direction="row">
        <Box sx={{ whiteSpace: "nowrap" }}>Some text3</Box>
        <Box sx={{ whiteSpace: "nowrap" }}>Some text4</Box>
      </Stack>
    </Stack>
  );
}

export default App;
