import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const HelpContext = createContext();

export const useHelp = () => useContext(HelpContext);

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const HelpProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        let endpoint = `${API_URL}/help-requests/mine`;

        // If helper, fetch nearby requests
        if (user?.role === 'helper') {
          // Default to city center or use geolocation
          const lat = 19.0760; // Default Mumbai
          const lng = 72.8777;
          endpoint = `${API_URL}/help-requests/nearby?lat=${lat}&lng=${lng}&radiusKm=10`;
        }

        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch help requests:', err);
      }
    };
    fetchRequests();
  }, [token, user]);

  const acceptRequest = async (requestId, helperId) => {
    try {
      const res = await fetch(`${API_URL}/help-requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          (r.id === requestId || r._id === requestId) ? { ...r, status: 'accepted', helperId } : r
        ));
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const addRequest = async (newRequestData) => {
    try {
      const { elderLocation, ...rest } = newRequestData;
      const body = {
        ...rest,
        lat: elderLocation?.lat,
        lng: elderLocation?.lng
      };

      const res = await fetch(`${API_URL}/help-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add help request:', err);
    }
  };

  return (
    <HelpContext.Provider value={{ requests, acceptRequest, addRequest }}>
      {children}
    </HelpContext.Provider>
  );
};
