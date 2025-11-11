import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetFetch } from '../useAssetFetch';
import { Asset } from '../../api/models';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useAssetData', () => {
  const mockAssets: Asset[] = [
    {
      id: 1,
      name: 'Test Asset 1',
      type: 'A',
      description: 'Test description',
      attributes: [
        { key: 'status', value: 'active' }
      ],
      children: [
        {
          id: 2,
          name: 'Child Asset',
          type: 'B'
        }
      ]
    },
    {
      id: 3,
      name: 'Test Asset 2',
      type: 'C'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAssetFetch());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.assets).toEqual([]);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch assets successfully and update state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockAssets,
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle wrapped API response format', async () => {
    const wrappedResponse = {
      success: true,
      data: mockAssets,
      message: 'Assets fetched successfully'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => wrappedResponse,
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockAssets);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error and update error state', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.assets).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('HTTP error! status: 404');
    expect(result.current.assets).toEqual([]);
  });

  it('should handle wrapped API response with error', async () => {
    const errorResponse = {
      success: false,
      data: [],
      message: 'Failed to fetch assets from database'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => errorResponse,
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch assets from database');
    expect(result.current.assets).toEqual([]);
  });

  it('should refetch data when refetch function is called', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockAssets,
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newMockAssets = [{ id: 4, name: 'New Asset', type: 'D' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => newMockAssets,
    } as Response);

    await result.current.refetch();

    expect(result.current.assets).toEqual(newMockAssets);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle invalid response format', async () => {
    const invalidResponse = { invalid: 'format' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidResponse,
    } as Response);

    const { result } = renderHook(() => useAssetFetch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Invalid response format');
    expect(result.current.assets).toEqual([]);
  });
});