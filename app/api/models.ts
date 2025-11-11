export interface AssetAttribute {
    key: string;
    value: string;
}

export interface Asset {
    id: number;
    name:string;
    type : string;
    description?: string;
    attributes?: AssetAttribute[];
    children?:Asset[] | Asset
}

export interface UseAssetDataResult {
    assets: Asset[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface AssetApiResponse {
    data: Asset[];
    message?: string;
    success: boolean;
}