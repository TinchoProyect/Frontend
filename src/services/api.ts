import axios, { AxiosError, isAxiosError } from 'axios';
import { ApiMovement, ApiClienteResponse, ApiError, ApiResponse } from '../types/client';
import { storage } from './storage';

const BASE_URL = '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive'
  },
  maxRedirects: 5,
  decompress: true,
  validateStatus: (status) => status >= 200 && status < 600
});

api.interceptors.request.use(
  (config) => {
    if (config.method?.toLowerCase() === 'get') {
      delete config.headers['Content-Type'];
    }

    console.info('Outgoing request:', {
      method: config.method,
      url: config.url,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.info('Response received:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    
    if (!config || !isAxiosError(error)) {
      console.error('Non-axios error:', error);
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    const shouldRetry = (
      (error.code === 'ECONNABORTED' || 
       error.code === 'ETIMEDOUT' || 
       error.code === 'ECONNRESET' || 
       !error.response || 
       error.response.status >= 500) &&
      config.__retryCount < MAX_RETRIES
    );

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    console.info(`Retrying request (${config.__retryCount}/${MAX_RETRIES}):`, config.url);

    const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
    const jitter = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay + jitter));

    return api(config);
  }
);

const validateResponse = <T>(response: any, endpoint: string): T => {
  if (!response) {
    throw new Error(`Empty response from server (${endpoint})`);
  }

  if (Array.isArray(response) && response.length === 0) {
    throw new Error('No records found.');
  }

  return response as T;
};

const getErrorMessage = (error: unknown, useCache: boolean): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
      console.error('Connection error:', {
        code: axiosError.code,
        message: axiosError.message,
        url: axiosError.config?.url
      });
      return useCache ? 'Showing locally stored data due to connection issues.' : 'No server connection.';
    }
    
    const status = axiosError.response.status;
    const errorData = axiosError.response.data;
    const url = axiosError.config?.url;

    console.error('Server response error:', {
      status,
      data: errorData,
      url,
      retryCount: axiosError.config?.__retryCount
    });

    switch (status) {
      case 404:
        return useCache
          ? 'Client not found in locally stored data.'
          : 'No records found for this client.';
      case 403:
      case 401:
        return 'You do not have permission to access this information.';
      case 500:
        return useCache
          ? 'Showing locally stored data due to server issues.'
          : 'Server error. Please try again in a few minutes.';
      default:
        return useCache
          ? 'Showing locally stored data due to connection issues.'
          : 'Error retrieving data. Please try again.';
    }
  }
  
  console.error('Unhandled error:', error);
  return useCache
    ? 'Showing locally stored data due to connection issues.'
    : 'Unknown error. Please try again.';
};

const handleApiError = (error: unknown, useCache: boolean): Error => {
  const message = getErrorMessage(error, useCache);
  return new Error(message);
};

export const fetchClientes = async (): Promise<ApiResponse<ApiClienteResponse[]>> => {
  try {
    const response = await api.get<ApiClienteResponse[]>('/Consulta', {
      params: { limit: 1000 }
    });
    
    const data = validateResponse<ApiClienteResponse[]>(response.data, '/Consulta');
    storage.saveClientes(data);
    
    return {
      data,
      fromCache: false
    };
  } catch (error) {
    const cached = storage.getClientes();
    if (cached && storage.isCacheValid(cached.timestamp)) {
      console.info('Using cached data:', {
        reason: 'API Error',
        timestamp: cached.timestamp,
        records: cached.data.length
      });
      return {
        data: cached.data,
        fromCache: true,
        lastUpdate: storage.formatLastUpdate(cached.timestamp)
      };
    }
    throw handleApiError(error, Boolean(cached));
  }
};

export const fetchClientData = async (clienteId: string): Promise<ApiResponse<ApiMovement[]>> => {
  if (!clienteId?.trim()) {
    throw new Error('Please select a valid client.');
  }

  try {
    const response = await api.get<ApiMovement[]>('/movimientos', {
      params: { clienteId: clienteId.trim() }
    });
    
    const data = validateResponse<ApiMovement[]>(response.data, '/movimientos');
    storage.saveMovimientos(clienteId, data);
    
    return {
      data,
      fromCache: false
    };
  } catch (error) {
    const cached = storage.getMovimientos(clienteId);
    if (cached && storage.isCacheValid(cached.timestamp)) {
      console.info('Using cached data:', {
        reason: 'API Error',
        clienteId,
        timestamp: cached.timestamp,
        records: cached.data.length
      });
      return {
        data: cached.data,
        fromCache: true,
        lastUpdate: storage.formatLastUpdate(cached.timestamp)
      };
    }
    throw handleApiError(error, Boolean(cached));
  }
};

export { api };