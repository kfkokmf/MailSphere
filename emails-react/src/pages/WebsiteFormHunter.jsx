import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const WebsiteFormHunter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const handleBrandChange = (event) => {
    const brandId = event.target.value;
    setSelectedBrand(brandId);
    const brand = brands.find(b => b.id === brandId);
    if (brand && brand.website) {
      setUrl(brand.website);
    } else {
      setUrl('');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      // Chamada ao backend (a implementar)
      // const response = await axios.post('/api/form-hunter', { url });
      // setResult(response.data);
      setTimeout(() => {
        setResult({ found: true, emailField: true, message: 'Formulário encontrado e email preenchido (simulação).' });
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Erro ao procurar formulário no website.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" gutterBottom>Procurar Formulário de Email</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="brand-select-label">Selecione uma Brand</InputLabel>
          <Select
            labelId="brand-select-label"
            value={selectedBrand}
            onChange={handleBrandChange}
            label="Selecione uma Brand"
          >
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Link do Website"
          value={url}
          onChange={e => setUrl(e.target.value)}
          fullWidth
          placeholder="https://exemplo.com"
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading || !url} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Procurar Formulário'}
        </Button>
        {result && (
          <Alert severity={result.found ? 'success' : 'warning'} sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
      </Paper>
    </Box>
  );
};

export default WebsiteFormHunter; 