import { useState, useEffect, useCallback } from 'react';
import { Asset, UseAssetDataResult } from '../api/models';
import {rawData} from '../data'

export const useAssetFetch = (): UseAssetDataResult => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssets = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await mockFetchAssets();
            
            if (!response.success) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: Asset[] = await response.json();
            setAssets(result);
        } catch (err) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'An unknown error occurred while fetching assets';
            
            console.error('Asset fetch error:', err);
            setError(errorMessage);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    return {
        assets,
        loading,
        error,
        refetch: fetchAssets
    };
};

const mockFetchAssets = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: Asset[] = rawData

    return {
        success: true,
        json: async () => mockData,
        status: 200
    };
};