import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const HelpContext = createContext();

export const useHelp = () => useContext(HelpContext);


const CITY_COORDS = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  newdelhi: { lat: 28.6139, lng: 77.2090 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
};

const getCityCoords = (city) => {
  if (!city) return { lat: 23.0225, lng: 72.5714 }; // Default to Ahmedabad
  const normalized = city.trim().toLowerCase().replace(/\s+/g, '');
  return CITY_COORDS[normalized] || { lat: 23.0225, lng: 72.5714 }; // Default to Ahmedabad
};

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
          // Default to helper's city coords or browser geolocation fallback
          const coords = getCityCoords(user?.city);
          endpoint = `${API_URL}/help-requests/nearby?lat=${coords.lat}&lng=${coords.lng}&radiusKm=10`;
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
