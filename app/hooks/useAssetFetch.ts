import { useState, useEffect, useCallback } from 'react';
import { Asset, UseAssetDataResult } from '../api/models';

export const useAssetFetch = (): UseAssetDataResult => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssets = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/assets');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const body: any = await response.json();

            if (Array.isArray(body)) {
                setAssets(body as Asset[]);
            } else if (body && typeof body === 'object' && 'success' in body) {
                if (body.success === true) {
                    if (Array.isArray(body.data)) {
                        setAssets(body.data as Asset[]);
                    } else {
                        setError('Invalid response format');
                        setAssets([]);
                    }
                } else {
                    setError(typeof body.message === 'string' ? body.message : 'Failed to fetch assets');
                    setAssets([]);
                }
            } else {
                setError('Invalid response format');
                setAssets([]);
            }
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
        refetch: async () => {
            await fetchAssets();
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    };
};