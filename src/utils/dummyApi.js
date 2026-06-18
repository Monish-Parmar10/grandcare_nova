// Simulates async API calls with a small delay.
// Replace these with real fetch() calls to your backend later.

const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));

export const loginUser = async ({ phone, password }) => {
  await delay();
  // In production, POST /api/auth/login
  return { success: true };
};

export const registerUser = async (data) => {
  await delay();
  // In production, POST /api/auth/register
  return { success: true };
};

export const getMedicines = async () => {
  await delay();
  // In production, GET /api/medicines
  return [];
};

export const saveMedicines = async (medicines) => {
  await delay();
  // In production, POST /api/medicines
  return { success: true };
};

export const getRoutines = async () => {
  await delay();
  // In production, GET /api/routines
  return [];
};

export const completeRoutine = async (id) => {
  await delay();
  // In production, PUT /api/routines/:id/complete
  return { success: true };
};

export const getQuiz = async () => {
  await delay();
  // In production, GET /api/quiz/today
  return [];
};

export const submitQuiz = async (answers) => {
  await delay();
  // In production, POST /api/quiz/submit
  return { score: 0 };
};

export const createHelpRequest = async (data) => {
  await delay();
  // In production, POST /api/help-requests
  return { success: true };
};

export const getNearbyRequests = async () => {
  await delay();
  // In production, GET /api/help-requests/nearby
  return [];
};

export const acceptHelpRequest = async (id) => {
  await delay();
  // In production, POST /api/help-requests/:id/accept
  return { success: true };
};
