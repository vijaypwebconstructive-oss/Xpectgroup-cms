const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getServerStatusMessage = (): string => {
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `Backend server should be running at: ${baseUrl}\n\nTo start the backend:\n1. Open terminal in 'backend' folder\n2. Run: npm install (if needed)\n3. Run: npm run dev\n4. Make sure MongoDB is running`;
};
