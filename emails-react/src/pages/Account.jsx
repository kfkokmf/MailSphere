import { useState } from 'react';
import { Box, Avatar, Typography, TextField, Button, Paper, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Account = () => {
  const { user, role, logout } = useAuth();
  const [name, setName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async () => {
    try {
      await updateProfile(user, { displayName: name, photoURL });
      await updateDoc(doc(db, 'users', user.uid), { name, photoURL });
      setSnackbar({ open: true, message: 'Perfil atualizado!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao atualizar perfil', severity: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    try {
      await updatePassword(user, newPassword);
      setSnackbar({ open: true, message: 'Password alterada!', severity: 'success' });
      setPasswordDialog(false);
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 400, borderRadius: 2.5 }}>
        <Avatar src={photoURL} sx={{ width: 80, height: 80, mb: 2 }} />
        <Button variant="outlined" component="label">
          Alterar imagem
          <input type="file" hidden accept="image/*" onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => setPhotoURL(ev.target.result);
              reader.readAsDataURL(file);
            }
          }} />
        </Button>
        <TextField label="Email" value={user.email} fullWidth margin="dense" InputProps={{ readOnly: true }} />
        <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth margin="dense" />
        <Button variant="contained" onClick={handleSave} sx={{ mt: 2, width: '100%' }}>Guardar alterações</Button>
        <Button variant="outlined" color="secondary" onClick={() => setPasswordDialog(true)} sx={{ width: '100%' }}>Mudar password</Button>
        <Button variant="outlined" color="error" onClick={logout} sx={{ width: '100%' }}>Logout</Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Mudar password</DialogTitle>
        <DialogContent>
          <TextField
            label="Nova password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            fullWidth
            margin="dense"
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handlePasswordChange}>Alterar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Account; 