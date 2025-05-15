import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/datepicker-mui.css';

const AddEmail = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    brand: '',
    flow: '',
    campaign: ''
  });
  const [brands, setBrands] = useState([]);
  const [flows, setFlows] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formError, setFormError] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [brandsRes, emailsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/brands'),
          axios.get('http://localhost:3000/api/emails')
        ]);
        setBrands(brandsRes.data.map(b => b.name));
        // Extrair flows e campaigns únicos dos emails
        const allEmails = emailsRes.data;
        setFlows(Array.from(new Set(allEmails.map(e => e.flow).filter(Boolean))));
        setCampaigns(Array.from(new Set(allEmails.map(e => e.campaign).filter(Boolean))));
      } catch (error) {
        setSnackbarMessage('Error loading data');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar nova brand
  const handleAddBrand = async (newBrand) => {
    try {
      await axios.post('http://localhost:3000/api/brands', { name: newBrand });
      setBrands(prev => [...prev, newBrand]);
      setFormData(prev => ({ ...prev, brand: newBrand }));
      setSnackbarMessage('Brand added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Error adding brand.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Adicionar novo flow
  const handleAddFlow = (newFlow) => {
    setFlows(prev => [...prev, newFlow]);
    setFormData(prev => ({ ...prev, flow: newFlow }));
    setSnackbarMessage('Flow added!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Adicionar nova campaign
  const handleAddCampaign = (newCampaign) => {
    setCampaigns(prev => [...prev, newCampaign]);
    setFormData(prev => ({ ...prev, campaign: newCampaign }));
    setSnackbarMessage('Campaign added!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.brand) {
      setFormError('Brand is required and must be selected from the list.');
      return;
    }
    if (!brands.includes(formData.brand)) {
      setFormError('Brand não encontrada. Selecione uma brand existente.');
      return;
    }
    if (!date || !time) {
      setFormError('Date and time are required.');
      return;
    }
    // Validação: apenas um dos campos flow ou campaign pode ser preenchido, nunca ambos
    if (!formData.flow && !formData.campaign) {
      setFormError('You must fill at least Flow or Campaign.');
      return;
    }
    if (formData.flow && formData.campaign) {
      setFormError('You can only fill Flow or Campaign, not both.');
      return;
    }
    try {
      const formattedDate = date ? date.toISOString().split('T')[0] : null;
      const formattedTime = time ? time : null;
      await axios.post('http://localhost:3000/api/emails', {
        ...formData,
        date: formattedDate,
        time: formattedTime
      });
      setSnackbarMessage('Email added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setSnackbarMessage('Error adding email. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3, maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <Typography variant="h4" gutterBottom>
          Add New Email
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          {/* Brand: dropdown apenas com brands existentes, fullWidth igual ao subject */}
          <TextField
            select
            fullWidth
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              style: {
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxWidth: 500
                  }
                }
              }
            }}
          >
            {brands.map((brand) => (
              <MenuItem key={brand} value={brand} sx={{
                maxWidth: 480,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{brand}</MenuItem>
            ))}
          </TextField>

          {/* Data obrigatória */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <DatePicker
              selected={date}
              onChange={setDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date"
              customInput={<TextField label="Date" required fullWidth />}
            />
            <TextField
              label="Time"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Flow: autocomplete, não obrigatório */}
          <Autocomplete
            freeSolo
            options={flows}
            value={formData.flow}
            onChange={(_, newValue) => {
              if (newValue && !flows.includes(newValue)) {
                handleAddFlow(newValue);
              } else {
                setFormData(prev => ({ ...prev, flow: newValue || '' }));
              }
            }}
            onInputChange={(_, newInputValue) => {
              setFormData(prev => ({ ...prev, flow: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Flow (optional)" margin="normal" />
            )}
          />

          {/* Campaign: autocomplete, não obrigatório */}
          <Autocomplete
            freeSolo
            options={campaigns}
            value={formData.campaign}
            onChange={(_, newValue) => {
              if (newValue && !campaigns.includes(newValue)) {
                handleAddCampaign(newValue);
              } else {
                setFormData(prev => ({ ...prev, campaign: newValue || '' }));
              }
            }}
            onInputChange={(_, newInputValue) => {
              setFormData(prev => ({ ...prev, campaign: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Campaign (optional)" margin="normal" />
            )}
          />

          {formError && (
            <Typography color="error" sx={{ mt: 1 }}>{formError}</Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              Add Email
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
        </form>
        )}
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEmail; 