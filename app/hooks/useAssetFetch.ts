import { useState, useEffect, useCallback } from 'react';
import { Asset, UseAssetDataResult } from '../types';
import { rawData } from '../data.js';

export const useAssetFetch = (): UseAssetDataResult => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadStaticAssets = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            setAssets(rawData as any);
        } catch (err) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'An unknown error occurred while loading assets';
            console.error('Static asset load error:', err);
            setError(errorMessage);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaticAssets();
    }, [loadStaticAssets]);

    return {
        assets,
        loading,
        error,
        refetch: async () => {
            await loadStaticAssets();
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    };
};