// SubscriptionContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import Axios from '../Axios'; // src/ dizininde olduğu için ../Axios

// Create the context
const SubscriptionContext = createContext();

// Create a custom hook to use the subscription context
export const useSubscription = () => {
  return useContext(SubscriptionContext);
};

// Context Provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await Axios.get('/api/directory/getSubscription', {
        headers: {
            'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
            'Content-Type': 'application/json',
        }
    });
      setSubscriptions(response.data);
    } catch (error) {
      alert('Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (newSubscriptionLabel) => {
    if (newSubscriptionLabel.trim() !== '') {
      try {
        const response = await Axios.post('/api/directory/addSubscription', {
          subscription_types: newSubscriptionLabel,
        },
        {
            headers: {
                'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönder
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
          await fetchSubscriptions(); // Refresh the subscriptions list
        }
      } catch (error) {
        alert('Error adding subscription');
      }
    }
  };

  const editSubscription = async (id, updatedLabel) => {
    try {
        const response = await Axios.put(
            `/api/directory/editSubscription`,
            {
                id: id,
                subscription_types: updatedLabel,
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönder
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status === 200) {
            await fetchSubscriptions(); // Abonelikler listesini yenile
        }
    } catch (error) {
      alert('Error editing subscription');
    }
  };

  const deleteSubscription = async (id) => {
    try {
      const response = await Axios.delete(`/api/directory/deleteSubscription/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
            'Content-Type': 'application/json',
        }
    });

      if (response.status === 200) {
        await fetchSubscriptions(); // Refresh the subscriptions list
      }
    } catch (error) {
      alert('Error deleting subscription');
    }
  };

  // Context value to provide
  const value = {
    subscriptions,
    loading,
    addSubscription,
    editSubscription,
    deleteSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
