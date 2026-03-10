import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

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
  id: number;
  county_name: string;
  lat: number;
  lng: number;
  value: number;
}

function handleError(error: unknown) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.detail || error.message);
  }
  throw error;
}
// ...existing code...
export const apiService = {
  async healthCheck() {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getCounties(params?: { limit?: number; skip?: number; has_programs?: boolean }) {
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

  async getCountyStatistics() {
    try {
      const res = await api.get('/api/v1/counties/statistics');
      return res.data as {
        total_counties: number;
        counties_with_programs: number;
        counties_without_programs: number;
        avg_impact_score: number;
        highest_impact_county: { id: number; county_name: string; county_population: number; total_program_impact_score: number; has_programs: number } | null;
      };
    } catch (error) {
      handleError(error);
      throw error;
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

  async getPrograms(params?: {
    search_query?: string;
    level?: string;
    modality?: string;
    institution_type?: string;
    county_name?: string;
    school_name?: string;
    skip?: number;
    limit?: number;
  }) {
    try {
      const res = await api.get('/api/v1/programs', { params });
      return res.data as { total: number; programs: Program[] };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getHeatMapData(metric: string) {
    try {
      const res = await api.get<{ counties: HeatMapData[] }>('/api/v1/visualizations/heat-map', {
        params: { metric },
      });
      return res.data.counties;
    } catch (error) {
      handleError(error);
    }
  },

  async submitDataRequest(payload: {
    request_type: 'report' | 'dataset';
    report_type?: string;
    counties?: string[];
    geographic_scope: string;
    data_format: string;
    datasets?: string[];
    intended_use: string;
    name: string;
    email: string;
    organization?: string;
    agree_to_terms: boolean;
  }): Promise<{ request_id: string; status: string; message: string }> {
    try {
      const res = await api.post('/api/v1/data-request', payload);
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

export { api };
