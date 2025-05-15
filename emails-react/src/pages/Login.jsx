import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Box, Paper, TextField, Button, Typography, Alert, Divider } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      onLogin(userCredential.user);
    } catch (err) {
      setLoading(false);
      setError('Login inválido. Verifique o email e a password.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setLoading(false);
      onLogin(result.user);
    } catch (err) {
      setLoading(false);
      setError('Erro ao autenticar com Google.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (password !== repeatPassword) {
      setError('As passwords não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Criar documento no Firestore com role: 'reader' e nome
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        name,
        role: 'reader'
      });
      setLoading(false);
      onLogin(userCredential.user);
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setError('O email já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A password é demasiado fraca (mínimo 6 caracteres).');
      } else if (err.code === 'auth/invalid-email') {
        setError('O email não é válido.');
      } else {
        setError('Erro ao criar conta.');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{
        p: 4,
        width: 370,
        minHeight: 420,
        boxShadow: 6,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{showRegister ? 'Criar Conta' : 'Login'}</Typography>
        <form onSubmit={showRegister ? handleRegister : handleSubmit} style={{ width: '100%' }}>
          {showRegister && (
            <TextField
              label="Nome"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {showRegister && (
            <TextField
              label="Repetir Password"
              type="password"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, fontWeight: 600 }}
            disabled={loading}
          >
            {showRegister ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>
        <Button
          color="secondary"
          fullWidth
          sx={{ mt: 1, fontWeight: 600 }}
          onClick={() => setShowRegister(r => !r)}
          disabled={loading}
        >
          {showRegister ? 'Já tenho conta' : 'Criar nova conta'}
        </Button>
        <Divider sx={{ my: 2, width: '100%' }}>ou</Divider>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ fontWeight: 600 }}
        >
          Entrar com Google
        </Button>
      </Paper>
    </Box>
  );
} 