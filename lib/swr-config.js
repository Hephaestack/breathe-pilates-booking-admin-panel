import axios from 'axios';

export const fetcher = async (url) => {
  if (!url) return null;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await axios.get(url, { 
      withCredentials: true,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (url.includes('/admin/bookings/')) {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.bookings)) {
        return response.data.bookings;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      } else {
        return [];
      }
    }
    
    return response.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (axios.isCancel(error)) {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const swrConfig = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 10000,
  loadingTimeout: 3000,
  shouldRetryOnError: false,
  keepPreviousData: true
};