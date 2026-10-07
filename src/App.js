import Typography from '@mui/material/Typography';
import { ColorModeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

function App() {
  return (
    <ColorModeProvider>
      <Layout>
        <Typography variant="h5" component="h1">
          Discover your favorite films
        </Typography>
      </Layout>
    </ColorModeProvider>
  );
}

export default App;
