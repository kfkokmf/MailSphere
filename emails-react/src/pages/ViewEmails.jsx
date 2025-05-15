import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Compare as CompareIcon,
  CompareArrows as CompareArrowsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite, getFavorites } from '../helpers/favorites';

const EMAILS_PER_ROW = 4;
const ROWS_PER_PAGE = 5;
const EMAILS_PER_PAGE = EMAILS_PER_ROW * ROWS_PER_PAGE;
const MIN_CARD_WIDTH = 225;
const MAX_ROWS = 5;

const ViewEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFlows, setSelectedFlows] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [selectedFilterTab, setSelectedFilterTab] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [quickDate, setQuickDate] = useState('');
  const { role, user, loading: authLoading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [emailsToCompare, setEmailsToCompare] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [page, setPage] = useState(1);
  const [realColumns, setRealColumns] = useState(1);
  const gridRef = useRef(null);

  if (authLoading || !user) {
    return <Box>Loading user...</Box>;
  }
  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      getFavorites(user.uid).then(setFavoriteIds);
    }
  }, [user]);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('/api/emails');
      setEmails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const content = email.content || email.body || '';
    const matchesSearch = (email.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(email.brand);
    const matchesFlow = selectedFlows.length === 0 || selectedFlows.includes(email.flow);
    const matchesCampaign = selectedCampaigns.length === 0 || selectedCampaigns.includes(email.campaign);
    let matchesDate = true;
    if (dateRange[0] && dateRange[1] && email.date) {
      const emailDate = new Date(email.date);
      matchesDate = emailDate >= dateRange[0] && emailDate <= dateRange[1];
    }
    return matchesSearch && matchesBrand && matchesFlow && matchesCampaign && matchesDate;
  });

  const getEmailPreview = (email) => {
    const content = email.content || email.body || '';
    if (!content) return 'No content available';
    // Remove tags HTML para o preview
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > 100 
      ? `${text.substring(0, 100)}...` 
      : text;
  };

  // Filtro de datas rápidas
  const handleQuickDate = (type) => {
    setQuickDate(type);
    let start = null;
    let end = new Date();
    if (type === '24h') {
      start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (type === 'week') {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (type === 'month') {
      start = new Date();
      start.setMonth(start.getMonth() - 1);
    } else if (type === 'year') {
      start = new Date();
      start.setFullYear(start.getFullYear() - 1);
    }
    setDateRange([start, end]);
  };

  const toggleFavorite = async (emailId) => {
    if (!user?.uid) {
      alert('Não autenticado!');
      return;
    }
    console.log('Clicou no favorito:', emailId);
    try {
      if (favoriteIds.includes(emailId)) {
        await removeFavorite(user.uid, emailId);
        setFavoriteIds(favoriteIds.filter(id => id !== emailId));
      } else {
        await addFavorite(user.uid, emailId);
        setFavoriteIds([...favoriteIds, emailId]);
      }
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err);
      alert('Erro ao atualizar favorito: ' + err.message);
    }
  };

  const handleEditClick = (email) => {
    setEditEmail(email);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditEmail(null);
  };

  const handleCompareClick = (email) => {
    setEmailsToCompare(prev => {
      const isSelected = prev.some(e => e.id === email.id);
      let newSelection;
      
      if (isSelected) {
        // Remove email if already selected
        newSelection = prev.filter(e => e.id !== email.id);
      } else {
        // Add email if not selected
        newSelection = [...prev, email];
      }
      
      // Only enter compare mode if we have exactly 2 emails
      setCompareMode(newSelection.length === 2);
      
      // If we have more than 2 emails, keep only the last 2
      if (newSelection.length > 2) {
        newSelection = newSelection.slice(-2);
      }
      
      return newSelection;
    });
  };

  const sanitizeEmailContent = (content) => {
    if (!content) return '';
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Remove href attributes from all links
    const links = tempDiv.getElementsByTagName('a');
    Array.from(links).forEach(link => {
      link.removeAttribute('href');
      link.style.cursor = 'default';
      link.style.textDecoration = 'none';
      link.style.color = 'inherit';
    });
    
    // Add pointer cursor to images
    const images = tempDiv.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      img.style.cursor = 'pointer';
    });
    
    return tempDiv.innerHTML;
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseSelectedEmail = () => {
    setSelectedEmail(null);
  };

  const renderEmailCard = (email) => (
    <Paper 
      key={email.id} 
      sx={{
        height: compareMode ? 'auto' : '480px',
        width: compareMode ? 'calc(50% - 12px)' : 'auto',
        overflow: 'hidden',
        p: 1,
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3
        }
      }}
      onClick={() => handleEmailClick(email)}
    >
      <ListItem alignItems="flex-start" sx={{ display: 'block', p: 0 }}>
        <Typography variant="subtitle2" color="text.primary" sx={{ fontSize: '14px', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {email.brand || 'Unknown Brand'}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(email.id);
              }} 
              aria-label="favorite"
            >
              {favoriteIds.includes(email.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleCompareClick(email);
              }} 
              aria-label="compare"
              color={emailsToCompare.some(e => e.id === email.id) ? 'primary' : 'default'}
            >
              {emailsToCompare.some(e => e.id === email.id) ? <CompareArrowsIcon /> : <CompareIcon />}
            </IconButton>
            {role === 'admin' && (
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(email);
                }} 
                aria-label="edit-email"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Typography>
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            padding: 4,
            overflow: compareMode ? 'auto' : 'hidden',
            height: compareMode ? 'auto' : 'calc(480px - 50px)',
            fontSize: '12px',
            position: 'relative',
            top: 0,
            left: 0,
            '& img': {
              cursor: 'pointer'
            }
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeEmailContent(email.content || email.body || '') }}
        />
      </ListItem>
    </Paper>
  );

  const renderSelectedEmail = (email) => (
    <Paper sx={{
      height: '100%',
      overflow: 'auto',
      p: 2,
      position: 'relative'
    }}>
      <IconButton
        onClick={handleCloseSelectedEmail}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {email.brand || 'Unknown Brand'}
      </Typography>
      <div
        style={{
          background: '#fff',
          borderRadius: 4,
          padding: 16,
          fontSize: '14px'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeEmailContent(email.content || email.body || '') }}
      />
    </Paper>
  );

  // After render, measure the real number of columns in the grid
  useEffect(() => {
    const measureColumns = () => {
      if (gridRef.current) {
        const style = window.getComputedStyle(gridRef.current);
        const cols = style.gridTemplateColumns.split(' ').length;
        setRealColumns(cols);
      }
    };
    measureColumns();
    window.addEventListener('resize', measureColumns);
    return () => window.removeEventListener('resize', measureColumns);
  }, []);
  // Also re-measure columns whenever the page changes (in case of dynamic content)
  useEffect(() => {
    if (gridRef.current) {
      const style = window.getComputedStyle(gridRef.current);
      const cols = style.gridTemplateColumns.split(' ').length;
      setRealColumns(cols);
    }
  }, [page, filteredEmails.length]);

  // Pagination logic
  const emailsPerPage = realColumns * MAX_ROWS;
  const totalEmails = filteredEmails.length;
  const totalPages = Math.max(1, Math.ceil(totalEmails / emailsPerPage));
  const paginatedEmails = filteredEmails.slice((page - 1) * emailsPerPage, page * emailsPerPage);

  // Reset page if columns change and current page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [realColumns, totalPages]);

  // Pagination buttons logic
  const getPaginationItems = () => {
    const items = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (page > 2) items.push(1);
      if (page > 3) items.push('start-ellipsis');
      for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) items.push(i);
      if (page < totalPages - 2) items.push('end-ellipsis');
      if (page < totalPages - 1) items.push(totalPages);
    }
    return items;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flex: 1,
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <Box sx={{ flex: 1, height: '100%', overflow: 'auto', p: 0, bgcolor: '#f5f5f5' }}>
        {selectedEmail ? (
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Selected email view (40%) */}
            <Box sx={{ width: '40%', height: '100%', pt: '20px', pl: '20px' }}>
              {renderSelectedEmail(selectedEmail)}
            </Box>
            {/* Related emails view (60%) */}
            <Box sx={{ width: '60%', height: '100%', overflow: 'auto', p: 2.5, pt: '70px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Other emails from {selectedEmail.brand}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CARD_WIDTH}px, 1fr))`, gap: 3 }}>
                {filteredEmails
                  .filter(email => email.brand === selectedEmail.brand && email.id !== selectedEmail.id)
                  .map(email => renderEmailCard(email))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex',
            flexDirection: compareMode ? 'row' : 'column',
            gap: 3,
            pb: 2,
            p: 2.5,
            pt: '70px',
            flexWrap: compareMode ? 'nowrap' : 'wrap',
            justifyContent: compareMode ? 'center' : 'flex-start'
          }}>
            {compareMode ? (
              emailsToCompare.map(email => renderEmailCard(email))
            ) : (
              <>
                <Box ref={gridRef} sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CARD_WIDTH}px, 1fr))`, gap: 3, width: '100%' }}>
                  {paginatedEmails.map(email => renderEmailCard(email))}
                </Box>
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <button
                        style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 8, width: 40, height: 40, cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#6b7280', fontSize: 18 }}
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >&lt;</button>
                      {getPaginationItems().map((item, idx) =>
                        item === 'start-ellipsis' || item === 'end-ellipsis' ? (
                          <span key={item + idx} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>...</span>
                        ) : (
                          <button
                            key={item}
                            style={{
                              border: '1px solid #d1d5db',
                              background: item === page ? '#aeb4bb' : 'white',
                              color: item === page ? 'white' : '#6b7280',
                              borderRadius: 8,
                              width: 40,
                              height: 40,
                              fontWeight: 500,
                              fontSize: 18,
                              cursor: item === page ? 'default' : 'pointer',
                              transition: 'all 0.2s'
                            }}
                            disabled={item === page}
                            onClick={() => setPage(item)}
                          >{item}</button>
                        )
                      )}
                      <button
                        style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 8, width: 40, height: 40, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#6b7280', fontSize: 18 }}
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >&gt;</button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Filtros à direita, sempre visível */}
      <Paper sx={{ 
        minWidth: '300px',
        width: '300px',
        height: filtersOpen ? '100vh' : '60px',
        borderLeft: '1px solid #e0e0e0',
        p: filtersOpen ? 2 : 0,
        overflowY: filtersOpen ? 'auto' : 'hidden',
        position: filtersOpen ? 'relative' : 'absolute',
        right: 0,
        top: 0,
        zIndex: filtersOpen ? 10 : 1000,
        boxShadow: filtersOpen ? 'none' : 'none',
        borderRadius: 0,
        background: filtersOpen ? '#fff' : 'transparent',
        pointerEvents: filtersOpen ? 'auto' : 'none',
        transition: 'all 0.3s',
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          pointerEvents: 'auto',
          background: '#fff',
          borderBottom: !filtersOpen ? '1px solid #e0e0e0' : 'none',
          borderRadius: !filtersOpen ? 0 : 0,
          height: 60,
          zIndex: 1100,
          position: 'relative',
          px: 2
        }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
            {filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={filtersOpen}>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Tabs para Brands, Flows e Campaigns */}
          <Tabs
            value={selectedFilterTab}
            onChange={(_, newValue) => setSelectedFilterTab(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Brands" />
            <Tab label="Flows" />
            <Tab label="Campaigns" />
          </Tabs>

          {/* Conteúdo das tabs */}
          {selectedFilterTab === 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1">Brands</Typography>
                <IconButton onClick={() => setBrandsOpen(!brandsOpen)}>
                  {brandsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={brandsOpen}>
                <List>
                  {Array.from(new Set(emails.map(email => email.brand).filter(Boolean))).map(brand => (
                    <ListItem key={brand} dense>
                      <ListItemText
                        primary={brand}
                        onClick={() => {
                          setSelectedBrands(prev =>
                            prev.includes(brand)
                              ? prev.filter(b => b !== brand)
                              : [...prev, brand]
                          );
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: selectedBrands.includes(brand) ? 'primary.main' : 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}
          {selectedFilterTab === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Flows</Typography>
              <List>
                {Array.from(new Set(emails.map(email => email.flow).filter(Boolean))).map(flow => (
                  <ListItem key={flow} dense>
                    <ListItemText
                      primary={flow}
                      onClick={() => {
                        setSelectedFlows(prev =>
                          prev.includes(flow)
                            ? prev.filter(f => f !== flow)
                            : [...prev, flow]
                        );
                      }}
                      sx={{
                        cursor: 'pointer',
                        color: selectedFlows.includes(flow) ? 'primary.main' : 'text.primary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {selectedFilterTab === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Campaigns</Typography>
              <List>
                {Array.from(new Set(emails.map(email => email.campaign).filter(Boolean))).map(campaign => (
                  <ListItem key={campaign} dense>
                    <ListItemText
                      primary={campaign}
                      onClick={() => {
                        setSelectedCampaigns(prev =>
                          prev.includes(campaign)
                            ? prev.filter(c => c !== campaign)
                            : [...prev, campaign]
                        );
                      }}
                      sx={{
                        cursor: 'pointer',
                        color: selectedCampaigns.includes(campaign) ? 'primary.main' : 'text.primary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Filtro de datas */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Date</Typography>
            <ToggleButtonGroup
              value={quickDate}
              exclusive
              onChange={(_, val) => val && handleQuickDate(val)}
              sx={{ mb: 1, width: '100%' }}
              fullWidth
            >
              <ToggleButton value="24h">Last 24h</ToggleButton>
              <ToggleButton value="week">Last week</ToggleButton>
              <ToggleButton value="month">Last month</ToggleButton>
              <ToggleButton value="year">Last year</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
              <DatePicker
                selected={dateRange[0]}
                onChange={date => setDateRange([date, dateRange[1]])}
                selectsStart
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                placeholderText="Start date"
                dateFormat="yyyy-MM-dd"
                isClearable
                customInput={<TextField label="Start date" fullWidth size="small" />} 
              />
              <DatePicker
                selected={dateRange[1]}
                onChange={date => setDateRange([dateRange[0], date])}
                selectsEnd
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                minDate={dateRange[0]}
                placeholderText="End date"
                dateFormat="yyyy-MM-dd"
                isClearable
                customInput={<TextField label="End date" fullWidth size="small" />} 
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {
                setDateRange([null, null]);
                setQuickDate('');
              }}
            >
              Clear date filter
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* Modal de edição de email (apenas admins) */}
      {role === 'admin' && (
        <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
          <DialogTitle>Editar Email</DialogTitle>
          <DialogContent>
            {/* Aqui pode colocar os campos para editar o email (subject, content, etc.) */}
            <TextField
              label="Subject"
              fullWidth
              margin="dense"
              value={editEmail?.subject || ''}
              onChange={e => setEditEmail({ ...editEmail, subject: e.target.value })}
            />
            <TextField
              label="Content"
              fullWidth
              margin="dense"
              multiline
              minRows={4}
              value={editEmail?.content || ''}
              onChange={e => setEditEmail({ ...editEmail, content: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancelar</Button>
            <Button variant="contained" onClick={() => {/* TODO: Salvar alterações no backend */ handleEditDialogClose();}}>Guardar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ViewEmails;