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

export type AssetNodeProps = {
  asset: Asset;
  depth?: number;
  expandedNodes: Set<number>;
  selectedAssetId?: number | null;
  onToggleNode: (id: number) => void;
  onSelect: (asset: Asset) => void;
};