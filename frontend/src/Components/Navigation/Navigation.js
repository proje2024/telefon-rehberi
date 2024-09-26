import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BackupIcon from '@mui/icons-material/Backup';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../Authenticator';
import { useSubscription } from '../../Context/SubscriptionContext';
import { useDynamicColumn } from '../../Context/DynamicColumnContext';
import Axios from '../../Axios';
import { message } from 'antd';


const Navigation = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { subscriptions, loading: loadingSubscriptions, addSubscription, editSubscription, deleteSubscription } = useSubscription();
  const { dynamicColumn, loading: loadingDynamicColumns, addDynamicColumn, editDynamicColumn, deleteDynamicColumn } = useDynamicColumn();

  // State for Subscription Dialogs
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [editSubscriptionDialogOpen, setEditSubscriptionDialogOpen] = useState(false);
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [updatedSubscriptionLabel, setUpdatedSubscriptionLabel] = useState('');
  const [newSubscriptionLabel, setNewSubscriptionLabel] = useState('');

  // State for Dynamic Column Dialogs
  const [dynamicColumnDialogOpen, setDynamicColumnDialogOpen] = useState(false);
  const [editDynamicColumnDialogOpen, setEditDynamicColumnDialogOpen] = useState(false);
  const [addDynamicColumnDialogOpen, setAddDynamicColumnDialogOpen] = useState(false);
  const [selectedDynamicColumn, setSelectedDynamicColumn] = useState(null);
  const [updatedDynamicColumnLabel, setUpdatedDynamicColumnLabel] = useState('');
  const [newDynamicColumnLabel, setNewDynamicColumnLabel] = useState('');

  // State for Restore Dialog
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  const isRoleAdmin = userRole === 1;

  const token = localStorage.getItem('token');

  // Logout Handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate('/login');
      } else {
        alert('Çıkış başarısız. Tekrar deneyin!');
      }
    } catch (error) {
      alert('Çıkış başarısız. İnternet bağlantınızı kontrol edin!');
    }
  };

  // Subscription Dialog Handlers
  const handleSubscriptionDialogOpen = () => setSubscriptionDialogOpen(true);
  const handleSubscriptionDialogClose = () => setSubscriptionDialogOpen(false);

  const handleEditSubscriptionDialogOpen = (subscription) => {
    setSelectedSubscription(subscription);
    setUpdatedSubscriptionLabel(subscription.label);
    setEditSubscriptionDialogOpen(true);
  };

  const handleEditSubscriptionDialogClose = () => {
    setEditSubscriptionDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleEditSubscription = () => {
    if (selectedSubscription) {
      editSubscription(selectedSubscription.value, updatedSubscriptionLabel);
      handleEditSubscriptionDialogClose();
    }
  };

  const handleAddSubscriptionDialogOpen = () => {
    setNewSubscriptionLabel('');
    setAddSubscriptionDialogOpen(true);
  };

  const handleAddSubscriptionDialogClose = () => {
    setAddSubscriptionDialogOpen(false);
  };

  const handleAddSubscription = () => {
    addSubscription(newSubscriptionLabel);
    handleAddSubscriptionDialogClose();
  };

  const handleDeleteSubscription = (id) => {
    deleteSubscription(id);
  };

  // Dynamic Column Dialog Handlers
  const handleDynamicColumnDialogOpen = () => setDynamicColumnDialogOpen(true);
  const handleDynamicColumnDialogClose = () => setDynamicColumnDialogOpen(false);

  const handleEditDynamicColumnDialogOpen = (dynamicColumn) => {
    setSelectedDynamicColumn(dynamicColumn);
    setUpdatedDynamicColumnLabel(dynamicColumn.attribute_name);
    setEditDynamicColumnDialogOpen(true);
  };

  const handleEditDynamicColumnDialogClose = () => {
    setEditDynamicColumnDialogOpen(false);
    setSelectedDynamicColumn(null);
  };

  const handleEditDynamicColumn = () => {
    if (selectedDynamicColumn) {
      editDynamicColumn(selectedDynamicColumn.id, updatedDynamicColumnLabel);
      handleEditDynamicColumnDialogClose();
    }
  };

  const handleAddDynamicColumnDialogOpen = () => {
    setNewDynamicColumnLabel('');
    setAddDynamicColumnDialogOpen(true);
  };

  const handleAddDynamicColumnDialogClose = () => {
    setAddDynamicColumnDialogOpen(false);
  };

  const handleAddDynamicColumn = () => {
    addDynamicColumn(newDynamicColumnLabel);
    handleAddDynamicColumnDialogClose();
  };

  const handleDeleteDynamicColumn = (id) => {
    deleteDynamicColumn(id);
  };

  // Backup and Restore Handlers
  const handleBackup = async () => {
    try {
      // Eğer token varsa, Axios istek başlığına ekle
      const response = await Axios.post('/api/directory/backupDatabase', {}, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const now = new Date();
        const formattedDate = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
        const filename = `database_backup_${formattedDate}.db`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Yedekleme işlemi sırasında bir hata oluştu.');
    }
  };
  

  const handleRestoreDialogOpen = () => setRestoreDialogOpen(true);
  const handleRestoreDialogClose = () => setRestoreDialogOpen(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleRestore = async () => {
    if (!file) {
      alert('Lütfen bir dosya seçin.');
      return;
    }

    setLoadingRestore(true);
    setRestoreMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await Axios.post('/api/directory/restoreDatabase', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        setRestoreMessage('Veritabanı başarıyla geri yüklendi.');
        message.success('Veritabanı başarıyla geri yüklendi.');
        window.location.reload();
      } else {
        setRestoreMessage('Geri yükleme sırasında bir hata oluştu.');
        message.success('Geri yükleme sırasında bir hata oluştu.');
      }
    } catch (error) {
      setRestoreMessage('Geri yükleme sırasında bir hata oluştu.');
      message.success('Geri yükleme sırasında bir hata oluştu.');
    } finally {
      setLoadingRestore(false);
      handleRestoreDialogClose();
    }
  };

  const renderTooltipIconButton = (title, onClick, IconComponent, style = {}) => (
    <Tooltip
      title={title}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            fontSize: '14px',
            color: 'white',
          },
        },
      }}
    >
      <IconButton onClick={onClick} style={{ color: 'white', ...style }}>
        {IconComponent}
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      {isLoggedIn && (
        <>
          {isRoleAdmin && renderTooltipIconButton("Veritabanını Yedekle", handleBackup, <CloudDownloadIcon />)}
          {isRoleAdmin && renderTooltipIconButton("Veritabanını Geri Yükle", handleRestoreDialogOpen, <BackupIcon />)}
          {isRoleAdmin && renderTooltipIconButton("Abonelikler", handleSubscriptionDialogOpen, <ManageAccountsIcon />)}
          {isRoleAdmin && renderTooltipIconButton("Dinamik Sütun Yönetimi", handleDynamicColumnDialogOpen, <PlaylistAddIcon />)}
          {renderTooltipIconButton("Çıkış Yap", handleLogout, <ExitToAppIcon />)}

          {/* Subscription Dialog */}
          <Dialog
            open={subscriptionDialogOpen}
            onClose={handleSubscriptionDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>
              Abonelik Yönetimi
              <IconButton
                style={{ marginLeft: 'auto' }}
                onClick={handleAddSubscriptionDialogOpen}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <List>
                {loadingSubscriptions ? (
                  <CircularProgress />
                ) : (
                  subscriptions.map((subscription) => (
                    <ListItem key={subscription.value}>
                      <ListItemText primary={subscription.label} />
                      <ListItemSecondaryAction>
                        {renderTooltipIconButton(
                          "Düzenle",
                          () => handleEditSubscriptionDialogOpen(subscription),
                          <EditIcon />
                        )}
                        {renderTooltipIconButton(
                          "Sil",
                          () => handleDeleteSubscription(subscription.value),
                          <DeleteIcon />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSubscriptionDialogClose}>Kapat</Button>
            </DialogActions>
          </Dialog>

          {/* Add Subscription Dialog */}
          <Dialog
            open={addSubscriptionDialogOpen}
            onClose={handleAddSubscriptionDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>Yeni Abonelik Ekle</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Abonelik İsmi"
                fullWidth
                value={newSubscriptionLabel}
                onChange={(e) => setNewSubscriptionLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddSubscriptionDialogClose}>İptal</Button>
              <Button onClick={handleAddSubscription}>Ekle</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Subscription Dialog */}
          <Dialog
            open={editSubscriptionDialogOpen}
            onClose={handleEditSubscriptionDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>Aboneliği Düzenle</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Abonelik İsmi"
                fullWidth
                value={updatedSubscriptionLabel}
                onChange={(e) => setUpdatedSubscriptionLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditSubscriptionDialogClose}>İptal</Button>
              <Button onClick={handleEditSubscription}>Kaydet</Button>
            </DialogActions>
          </Dialog>

          {/* Dynamic Column Dialog */}
          <Dialog
            open={dynamicColumnDialogOpen}
            onClose={handleDynamicColumnDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>
              Dinamik Sütun Yönetimi
              <IconButton
                style={{ marginLeft: 'auto' }}
                onClick={handleAddDynamicColumnDialogOpen}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <List>
                {loadingDynamicColumns ? (
                  <CircularProgress />
                ) : (
                  dynamicColumn.map((column) => (
                    <ListItem key={column.id}>
                      <ListItemText primary={column.attribute_name} />
                      <ListItemSecondaryAction>
                        {renderTooltipIconButton(
                          "Düzenle",
                          () => handleEditDynamicColumnDialogOpen(column),
                          <EditIcon />
                        )}
                        {renderTooltipIconButton(
                          "Sil",
                          () => handleDeleteDynamicColumn(column.id),
                          <DeleteIcon />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDynamicColumnDialogClose}>Kapat</Button>
            </DialogActions>
          </Dialog>

          {/* Add Dynamic Column Dialog */}
          <Dialog
            open={addDynamicColumnDialogOpen}
            onClose={handleAddDynamicColumnDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>Yeni Dinamik Sütun Ekle</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Sütun İsmi"
                fullWidth
                value={newDynamicColumnLabel}
                onChange={(e) => setNewDynamicColumnLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddDynamicColumnDialogClose}>İptal</Button>
              <Button onClick={handleAddDynamicColumn}>Ekle</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Dynamic Column Dialog */}
          <Dialog
            open={editDynamicColumnDialogOpen}
            onClose={handleEditDynamicColumnDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>Dinamik Kolonu Düzenle</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Sütun İsmi"
                fullWidth
                value={updatedDynamicColumnLabel}
                onChange={(e) => setUpdatedDynamicColumnLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDynamicColumnDialogClose}>İptal</Button>
              <Button onClick={handleEditDynamicColumn}>Kaydet</Button>
            </DialogActions>
          </Dialog>

          {/* Restore Dialog */}
          <Dialog
            open={restoreDialogOpen}
            onClose={handleRestoreDialogClose}
            PaperProps={{
              style: {
                borderRadius: '15px',
              },
            }}
          >
            <DialogTitle>Veritabanını Geri Yükle</DialogTitle>
            <DialogContent>
              <input type="file" onChange={handleFileChange} />
              {loadingRestore && <CircularProgress />}
              {restoreMessage && <div>{restoreMessage}</div>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRestoreDialogClose}>Kapat</Button>
              <Button onClick={handleRestore}>Yükle</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Navigation;
