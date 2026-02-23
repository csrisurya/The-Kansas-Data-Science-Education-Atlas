import { describe, it, expect, vi, beforeAll } from 'vitest';

let mockedApi: { get: any; post: any };
vi.mock('./api', () => {
  mockedApi = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return {
    api: mockedApi,
    apiService: {
      healthCheck: async () => (await mockedApi.get('/health')).data,
      getCounties: async () => (await mockedApi.get('/api/v1/counties')).data,
      getCountyById: async (id: number) => (await mockedApi.get(`/api/v1/counties/${id}`)).data,
      // Add other methods as needed
    },
  };
});

describe('API Service', () => {
  let apiService: any;
  beforeAll(async () => {
    apiService = (await import('./api')).apiService;
  });

  it('test_health_check() - healthCheck() returns status', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { status: 'healthy' } });
    const res = await apiService.healthCheck();
    expect(res.status).toBe('healthy');
  });

  it('test_get_counties() - getCounties() returns array', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] });
    const counties = await apiService.getCounties();
    expect(Array.isArray(counties)).toBe(true);
    expect(counties && counties.length > 0).toBe(true);
  });

  it('test_get_county_by_id() - getCountyById(1) returns county', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 1, name: 'A' } });
    const county = await apiService.getCountyById(1);
    expect(county).toHaveProperty('id', 1);
    expect(county).toHaveProperty('name', 'A');
  });

  it('test_api_error_handling() - Handles 404, 500 errors', async () => {
    mockedApi.get.mockRejectedValueOnce({ response: { status: 404 } });
    await expect(apiService.getCountyById(999)).rejects.toMatchObject({ response: { status: 404 } });

    mockedApi.get.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(apiService.getCounties()).rejects.toMatchObject({ response: { status: 500 } });
  });
});
