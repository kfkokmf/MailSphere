import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import ViewEmails from './pages/ViewEmails';
import AddEmail from './pages/AddEmail';
import Brands from './pages/Brands';
import './App.css';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, Button, CircularProgress } from '@mui/material';
import Favorites from './pages/Favorites.jsx';
import Account from './pages/Account.jsx';
import WebsiteFormHunter from './pages/WebsiteFormHunter.jsx';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ children, adminOnly }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Login onLogin={() => {}} />;
  if (adminOnly && role !== 'admin') return <Box sx={{ p: 4 }}>Acesso restrito a administradores.</Box>;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { mode } = useThemeContext();
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
  });
  return (
    <MuiThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

function AppContent() {
  const { user, logout, loading } = useAuth();
  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Login onLogin={() => {}} />;
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ViewEmails />} />
          <Route path="/add" element={<ProtectedRoute adminOnly={true}><AddEmail /></ProtectedRoute>} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/account" element={<Account />} />
          <Route path="/form-hunter" element={<ProtectedRoute adminOnly={true}><WebsiteFormHunter /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      </div>
  );
}

export default App;
