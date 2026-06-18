# GrandCare Data Contracts

This document outlines the expected data structures (shapes) for the backend API. The frontend currently uses mock versions of these in `src/data/`. When integrating a backend, ensure the endpoints return and accept data in these formats.

## User Models

### User
```typescript
type User = {
  id: string;
  role: 'elder' | 'helper';
  name: string;
  phone: string; // Used for login
  city: string;
  pincode: string;
  
  // Elder specific fields
  hasSmartphone?: boolean;
  hasWhatsApp?: boolean;
  hasFamilySupport?: boolean;
  grandScore?: number; // Total points earned
  
  // Helper specific fields
  skills?: string[]; // e.g. ['Grocery', 'Tech help']
  availability?: boolean;
};
```

### EmergencyContact
```typescript
type EmergencyContact = {
  id: string;
  elderId: string;
  name: string;
  relationship: string;
  phone: string;
};
```

## Elder Features

### Medicine
```typescript
type Medicine = {
  id: string;
  name: string;
  purpose: string;
  dosage: string;
  times: ('morning' | 'afternoon' | 'night')[];
  notes: string;
};
```

### RoutineTask
```typescript
type RoutineTask = {
  id: string;
  title: string;
  description: string;
  completedToday: boolean;
  points: number;
};
```

### NewsQuizQuestion
```typescript
type NewsQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
};
```

## Community Help

### HelpRequest
```typescript
type HelpRequest = {
  id: string;
  elderId: string;
  elderName: string;
  type: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed';
  helperId?: string; // ID of the helper who accepted
  distance?: string; // Optional: calculated by backend based on coords
  elderLocation: {
    lat: number;
    lng: number;
  };
  createdAt: string; // ISO Date String
};
```

### ChatMessage
```typescript
type ChatMessage = {
  id: string;
  requestId: string; // Links message to a HelpRequest
  senderId: string;
  senderRole: 'elder' | 'helper';
  text: string;
  createdAt: string; // ISO Date String
};
```
