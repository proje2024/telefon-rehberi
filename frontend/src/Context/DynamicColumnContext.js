import React, { createContext, useState, useContext, useEffect } from 'react';
import Axios from '../Axios';

const DynamicColumnContext = createContext();

export const useDynamicColumn = () => {
  return useContext(DynamicColumnContext);
};

export const DynamicColumnProvider = ({ children }) => {
  const [dynamicColumn, setDynamicColumn] = useState([]);
  const [loadingDynamic, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [dynamicRefreshTrigger, setDynamicRefreshTrigger] = useState(false);

  useEffect(() => {
    fetchDynamicColumn();
  }, [dynamicRefreshTrigger]);

  const fetchDynamicColumn = async () => {
    setLoading(true);
    try {
      const response = await Axios.get('/api/directory/getDynamicColumn', {
        headers: {
            'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
            'Content-Type': 'application/json',
        }
    });
      setDynamicColumn(response.data);
    } catch (error) {
      alert('Error fetching dynamic columns');
    } finally {
      setLoading(false);
    }
  };

  const addDynamicColumn = async (newDynamicColumnLabel) => {
  if (newDynamicColumnLabel.trim() !== '') {
      try {
        const response = await Axios.post('/api/directory/addDynamicColumn', {
          attribute_name: newDynamicColumnLabel,
        },
        {
            headers: {
                'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönder
                'Content-Type': 'application/json',
            }
        });
        if (response.status === 200) {
          await fetchDynamicColumn(); // Refresh the subscriptions list
        }
      } catch (error) {
        alert('Error adding subscription');
      }
    }
  };

  const editDynamicColumn = async (id, updatedLabel) => {
    try {
      const response = await Axios.put(`/api/directory/editDynamicColumn`, {
        id: id,
        attribute_name: updatedLabel,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.status === 200) {
        await fetchDynamicColumn(); 
        setDynamicRefreshTrigger(prev => !prev); // refreshTrigger'ı tetikle
      }
    } catch (error) {
      alert('Error editing dynamic column');
    }
  };

  const deleteDynamicColumn = async (id) => {
      try {
        const response = await Axios.delete(`/api/directory/deleteDynamicColumn/${id}`, {
          headers: {
              'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
              'Content-Type': 'application/json',
          }
      });
        if (response.status === 200) {
          await fetchDynamicColumn(); // Refresh the subscriptions list
        }
      } catch (error) {
        alert('Error deleting subscription');
      }
  };
  
  // Context value to provide
  const value = {
    dynamicColumn,
    loadingDynamic,
    addDynamicColumn,
    editDynamicColumn,
    deleteDynamicColumn,
    dynamicRefreshTrigger,
  };

  return (
    <DynamicColumnContext.Provider value={value}>
      {children}
    </DynamicColumnContext.Provider>
  );
};
