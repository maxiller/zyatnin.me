import { useState } from 'react';
import Link from '@mui/material/Link';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, Grid, Card, CardContent, Chip, Button } from '@mui/material';
import AppAppBar from './components/AppAppBar';
import { aboutText, cases, expertise, Case } from './data';

// Создаем тему в стиле терминала
const terminalTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000', // Черный фон
      paper: '#1a1a1a',   // Темно-серый для карточек
    },
    text: {
      primary: '#00ff00', // Зеленый текст, как в старых терминалах
      secondary: '#00cc00',
    },
    primary: {
      main: '#00ff00',
    },
    divider: '#00ff00',
  },
  typography: {
    fontFamily: '"Courier New", Courier, monospace', // Моноширинный шрифт
    h2: { fontSize: '2rem', fontWeight: 'normal' },
    h3: { fontSize: '1.5rem', fontWeight: 'normal' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Без заглавных букв
          border: '1px solid #00ff00',
          color: '#00ff00',
          '&:hover': { backgroundColor: '#003300' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #00ff00',
          backgroundColor: '#1a1a1a',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#003300',
          color: '#00ff00',
          border: '1px solid #00ff00',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#00ff00',
          textDecoration: 'underline',
          '&:hover': { color: '#00cc00' },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  return (
      <ThemeProvider theme={terminalTheme}>
        <CssBaseline />
        <AppAppBar />
        <Container maxWidth="lg" sx={{ my: 4, minHeight: '100vh' }}>
          {/* Обо мне */}
          <Box id="about" sx={{ py: 4 }}>
            <Typography variant="h2" gutterBottom>dir /about</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box
                  component="img"
                  src="https://via.placeholder.com/200x300"
                  sx={{ maxWidth: 200, border: '1px solid #00ff00' }}
              />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{aboutText}</Typography>
            </Box>
          </Box>

          {/* Кейсы */}
          <Box id="cases" sx={{ py: 4 }}>
            <Typography variant="h2" gutterBottom>dir /cases</Typography>
            {selectedCase !== null ? (
                <Box>
                  <Button onClick={() => setSelectedCase(null)} sx={{ mb: 2 }}>cd ..</Button>
                  <Typography variant="h3">{cases[selectedCase].title}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>{cases[selectedCase].fullText}</Typography>
                  <Box sx={{ mt: 2 }}>
                    {cases[selectedCase].tags.map((tag: string) => (
                        <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Box>
            ) : (
                <Grid container spacing={2}>
                  {cases.map((item: Case, index: number) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card sx={{ cursor: 'pointer' }} onClick={() => setSelectedCase(index)}>
                          <CardContent>
                            <Typography variant="h5">{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {item.tags.map((tag: string) => (
                                  <Chip key={tag} label={tag} size="small" sx={{ mr: 1 }} />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                  ))}
                </Grid>
            )}
          </Box>

          {/* Экспертиза */}
          <Box id="expertise" sx={{ py: 4 }}>
            <Typography variant="h2" gutterBottom>dir /expertise</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {expertise.map((skill: string) => (
                  <Chip
                      key={skill}
                      label={skill}
                      clickable
                      component="a"
                      href="#cases"
                      sx={{ py: 1 }}
                  />
              ))}
            </Box>
          </Box>

          {/* Контакты */}
          <Box id="contacts" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom>dir /contacts</Typography>
            <Link href="https://t.me/m/2kXggTsBNTJi" variant="h6">
              type telegram
            </Link>
          </Box>
        </Container>
      </ThemeProvider>
  );
};

export default App;