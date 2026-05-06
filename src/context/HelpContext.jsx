import React, { createContext, useContext, useState } from 'react';
import { mockHelpRequests } from '../data/mockHelpRequests';

const HelpContext = createContext();

export const useHelp = () => useContext(HelpContext);

export const HelpProvider = ({ children }) => {
  const [requests, setRequests] = useState(mockHelpRequests);

  const acceptRequest = (requestId, helperId) => {
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'accepted', helperId } : r
    ));
  };

  const addRequest = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  return (
    <HelpContext.Provider value={{ requests, acceptRequest, addRequest }}>
      {children}
    </HelpContext.Provider>
  );
};
