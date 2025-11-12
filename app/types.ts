export type AssetAttribute = {
  key: string;
  value: string | number | boolean;
};

export type Asset = {
  id: number;
  name: string;
  type: string;
  description?: string;
  attributes?: AssetAttribute[];
  children?: Asset | Asset[];
};

export type UseAssetDataResult = {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};