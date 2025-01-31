import Link from "@mui/material/Link";
import MainMenuBar from "./components/NavBar";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Typography } from "@mui/material";
import AppAppBar from "./components/AppAppBar";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container
          maxWidth="lg"
          component="main"
          sx={{ display: "flex", flexDirection: "column", my: 16, gap: 4 }}
        >
          <AppAppBar />
          <Box align="center">
            <Typography variant="h3" gutterBottom>Maxim Zyatnin</Typography>
            <Typography variant="subtitle1">
              Your ultimate partner to make customer happy
            </Typography>
            <Link href="https://t.me/m/2kXggTsBNTJi">Request CV</Link>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
