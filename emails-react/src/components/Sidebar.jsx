import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Box
} from '@mui/material';
import {
  Email as EmailIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const drawerWidth = 240;
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'View', icon: <EmailIcon />, path: '/' },
    ...(role === 'admin' ? [{ text: 'Add', icon: <AddIcon />, path: '/add' }] : []),
    { text: 'Brands', icon: <BusinessIcon />, path: '/brands' },
    { text: 'Favoritos', icon: <FavoriteIcon />, path: '/favorites' },
    ...(role === 'admin' ? [{ text: 'Form Hunter', icon: <LinkIcon />, path: '/form-hunter' }] : []),
    { text: 'Planos', icon: <MonetizationOnIcon />, path: '/pricing' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/account')}>
        <Avatar alt={user?.displayName || 'User'} src={user?.photoURL || '/img/User.png'} />
        <Box>
          <Box sx={{ fontWeight: 'bold' }}>{user?.displayName || 'User'}</Box>
        </Box>
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      
      <List>
        <ListItem
          component={Link}
          to="/settings"
          selected={location.pathname === '/settings'}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar; 