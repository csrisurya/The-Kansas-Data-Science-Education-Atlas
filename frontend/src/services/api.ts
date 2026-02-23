import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Types
export interface County {
  id: number;
  name: string;
  has_programs: boolean;
  // Add more fields as needed
}

export interface Program {
  id: number;
  name: string;
  // Add more fields as needed
}

export interface HeatMapData {
  county_id: number;
  value: number;
}

function handleError(error: unknown) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.detail || error.message);
  }
  throw error;
}

export const apiService = {
  async healthCheck() {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getCounties(params?: { limit?: number; offset?: number; has_programs?: boolean }) {
    try {
      const res = await api.get<County[]>('/api/v1/counties', { params });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getCountyById(id: number) {
    try {
      const res = await api.get<County>(`/api/v1/counties/${id}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async compareCounties(ids: number[]) {
    try {
      const res = await api.post('/api/v1/counties/compare', { ids });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async searchPrograms(filters?: any) {
    try {
      const res = await api.get<Program[]>('/api/v1/programs/search', { params: filters });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getHeatMapData(metric: string) {
    try {
      const res = await api.get<HeatMapData[]>(`/api/v1/heatmap/${metric}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },
};
