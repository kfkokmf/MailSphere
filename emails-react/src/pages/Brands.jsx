import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Brands = () => {
  const { role } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit' or 'view'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandEmail, setBrandEmail] = useState('');
  const [brandNiche, setBrandNiche] = useState('');
  const [brandWebsite, setBrandWebsite] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleteButtonReady, setDeleteButtonReady] = useState(false);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, brand = null) => {
    setDialogType(type);
    setFormError('');
    if ((type === 'edit' || type === 'view') && brand) {
      setSelectedBrand(brand);
      setBrandName(brand.name);
      setBrandEmail(brand.email || '');
      setBrandNiche(brand.niche || '');
      setBrandWebsite(brand.website || '');
    } else {
      setSelectedBrand(null);
      setBrandName('');
      setBrandEmail('');
      setBrandNiche('');
      setBrandWebsite('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBrand(null);
    setBrandName('');
    setBrandEmail('');
    setBrandNiche('');
    setBrandWebsite('');
  };

  const handleSubmit = async () => {
    const missingFields = [];
    if (!brandName.trim()) missingFields.push('Name');
    if (!brandNiche.trim()) missingFields.push('Niche');
    if (!brandWebsite.trim()) missingFields.push('Website');
    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        setFormError(`Tens de preencher o campo ${missingFields[0]}`);
      } else {
        setFormError(`Tens de preencher os campos ${missingFields.join(', ')}`);
      }
      return;
    }
    setFormError('');
    try {
      if (dialogType === 'add') {
        await axios.post('/api/brands', {
          name: brandName,
          email: brandEmail,
          niche: brandNiche,
          website: brandWebsite
        });
        setSnackbar({
          open: true,
          message: 'Brand added successfully!',
          severity: 'success'
        });
      } else {
        await axios.put(`/api/brands/${selectedBrand.id}`, {
          name: brandName,
          email: brandEmail,
          niche: brandNiche,
          website: brandWebsite
        });
        setSnackbar({
          open: true,
          message: 'Brand updated successfully!',
          severity: 'success'
        });
      }
      fetchBrands();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving brand:', error);
      setSnackbar({
        open: true,
        message: 'Error saving brand. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (brandId) => {
    try {
      await axios.delete(`/api/brands/${brandId}`);
      setSnackbar({
        open: true,
        message: 'Brand deleted successfully!',
        severity: 'success'
      });
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting brand. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteDialog = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
    setDeleteCountdown(5);
    setDeleteButtonReady(false);
  };

  useEffect(() => {
    if (deleteDialogOpen && !deleteButtonReady) {
      const timer = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setDeleteButtonReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [deleteDialogOpen, deleteButtonReady]);

  const handleConfirmDelete = async () => {
    if (brandToDelete) {
      await handleDelete(brandToDelete.id);
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Brands</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flex: 1, background: '#fff' }}
        />
        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Brand
          </Button>
        )}
      </Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : filteredBrands.length === 0 ? (
        <Typography color="text.secondary">No brands found.</Typography>
      ) : (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredBrands.map((brand) => (
            <Paper key={brand.id} elevation={2} sx={{ px: 2, py: 1, borderRadius: 2 }}>
              <ListItem
                disableGutters
                secondaryAction={
                  role === 'admin' ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
                      <IconButton edge="end" onClick={() => handleOpenDialog('edit', brand)} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => openDeleteDialog(brand)} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton edge="end" onClick={() => handleOpenDialog('view', brand)} aria-label="view">
                      <VisibilityIcon />
                    </IconButton>
                  )
                }
                sx={{ alignItems: 'center' }}
              >
                <ListItemText
                  primary={brand.name}
                  primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: 18 } }}
                  sx={{ mr: 3 }}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogType === 'add' ? 'Add Brand' : dialogType === 'edit' ? 'Edit Brand' : 'View Brand'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={dialogType === 'view'}
          />
          <TextField
            label="Email"
            value={brandEmail}
            onChange={e => setBrandEmail(e.target.value)}
            fullWidth
            margin="normal"
            type="email"
            disabled={dialogType === 'view'}
          />
          <TextField
            label="Niche"
            value={brandNiche}
            onChange={e => setBrandNiche(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={dialogType === 'view'}
          />
          <TextField
            label="Website"
            value={brandWebsite}
            onChange={e => setBrandWebsite(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={dialogType === 'view'}
          />
          {formError && (
            <Typography color="error" sx={{ mt: 1 }}>{formError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogType !== 'view' && (
            <Button variant="contained" onClick={handleSubmit}>
              {dialogType === 'add' ? 'Add' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Tem a certeza que quer apagar esta brand?
          </Typography>
          <Typography color="error" gutterBottom>
            Todos os emails associados a esta brand vão ser apagados <b>permanentemente</b> da base de dados.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: '20px' }}
        >
          <Button onClick={handleCancelDelete} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color={deleteButtonReady ? 'primary' : 'error'}
            disabled={!deleteButtonReady}
            sx={{ minWidth: 90, fontWeight: 600 }}
          >
            Sim
            {!deleteButtonReady && (
              <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 14 }}>
                {deleteCountdown}
              </span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Brands; 