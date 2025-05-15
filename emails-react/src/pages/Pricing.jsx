import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import axios from 'axios';

const plans = [
  {
    name: 'Mensal',
    price: '€20',
    period: '/mês',
    features: [
      'Acesso a todas as funcionalidades',
      'Suporte por email',
      'Cancelamento a qualquer momento',
    ],
    cta: 'Começar mensal',
    highlight: false,
    discount: null,
    priceId: 'price_1RP39vJ3y6UBdPCPkULn2u6g',
  },
  {
    name: 'Anual',
    price: '€200',
    period: '/ano',
    features: [
      'Acesso a todas as funcionalidades',
      'Suporte prioritário',
      '2 meses grátis (paga só 10 meses)',
      'Cancelamento a qualquer momento',
    ],
    cta: 'Começar anual',
    highlight: true,
    discount: 'Poupa 2 meses (paga só 10 meses)',
    priceId: 'price_1RP3AEJ3y6UBdPCPnKeR6hUV',
  },
];

const handleSubscribe = async (priceId) => {
  try {
    const res = await axios.post('/api/payments/create-checkout-session', { priceId });
    window.location.href = res.data.url;
  } catch (err) {
    alert('Erro ao iniciar pagamento: ' + (err.response?.data?.error || err.message));
  }
};

const Pricing = () => (
  <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
    <Typography variant="h3" align="center" gutterBottom>
      Planos e Preços
    </Typography>
    <Typography align="center" color="text.secondary" sx={{ mb: 5 }}>
      Escolhe o plano que melhor se adapta ao teu negócio. Cancela quando quiseres.
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {plans.map((plan) => (
        <Grid item xs={12} sm={6} md={4} key={plan.name}>
          <Paper elevation={plan.highlight ? 8 : 2} sx={{
            p: 4,
            borderRadius: 4,
            border: plan.highlight ? '2px solid #1976d2' : '1px solid #e0e0e0',
            boxShadow: plan.highlight ? '0 8px 32px rgba(25,118,210,0.10)' : undefined,
            position: 'relative',
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {plan.highlight && (
              <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#1976d2', color: '#fff', px: 2, py: 0.5, borderRadius: 2, fontWeight: 600, fontSize: 14 }}>
                Mais popular
              </Box>
            )}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{plan.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{plan.price}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>{plan.period}</Typography>
            </Box>
            {plan.discount && (
              <Typography color="success.main" sx={{ mb: 2, fontWeight: 500, fontSize: 16 }}>
                {plan.discount}
              </Typography>
            )}
            <Box sx={{ mb: 3, width: '100%' }}>
              {plan.features.map((feature, idx) => (
                <Typography key={idx} color="text.secondary" sx={{ mb: 1, fontSize: 16, textAlign: 'center' }}>
                  {feature}
                </Typography>
              ))}
            </Box>
            <Button
              variant={plan.highlight ? 'contained' : 'outlined'}
              size="large"
              fullWidth
              sx={{ mt: 'auto', fontWeight: 600 }}
              onClick={() => handleSubscribe(plan.priceId)}
            >
              {plan.cta}
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Pricing; 