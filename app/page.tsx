"use client"
import { useMemo, useState } from 'react';
import { useAssetFetch } from './hooks/useAssetFetch';
import { ChevronLeft, Filter, X, Search } from 'lucide-react';
// import { rawData } from './data';
import { Asset, AssetAttribute } from './types';
import { AssetNode } from './components/AssetNode';
import { AssetDetails } from './components/AssetDetails';

export default function AssetMonitoringUI() {
    const { assets, loading, error, refetch } = useAssetFetch();
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set<number>());
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [nameQuery, setNameQuery] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showMobileDetails, setShowMobileDetails] = useState(false);

    const allTypes = useMemo<string[]>(() => {
        const types = new Set<string>();
        const collectTypes = (assets: Asset | Asset[]) => {
            const assetArray = Array.isArray(assets) ? assets : [assets];
            assetArray.forEach((asset: Asset) => {
                types.add(asset.type);
                if (asset.children) {
                    collectTypes(asset.children);
                }
            });
        };
        collectTypes(assets);
        return Array.from(types).sort();
    }, [assets]);

    const filterAssets = (assets: Asset[]): Asset[] | null => {
        const assetArray = Array.isArray(assets) ? assets : [assets];
        console.log('assetArray', assetArray);
        const query = nameQuery.trim().toLowerCase();
        if (!typeFilter && !query) return assetArray;

        const filtered: Asset[] = [];

        assetArray.forEach((asset: Asset) => {
            const matchesType = !typeFilter || asset.type === typeFilter;
            const matchesName = !query || asset.name.toLowerCase().includes(query);
            let filteredChildren = null;

            if (asset.children) {
                const assetChildArray = Array.isArray(asset.children) ? asset.children : [asset.children]
                filteredChildren = filterAssets(assetChildArray);
            }

            const includeSelf = matchesType && matchesName;
            const includeChild = !!filteredChildren && filteredChildren.length > 0;

            if (includeSelf || includeChild) {
                filtered.push({
                    ...asset,
                    children: filteredChildren || undefined
                });
            }
        });

        return filtered.length > 0 ? filtered : null;
    };

    const filteredAssets = filterAssets(assets) || [];

    const countAssets = (assets: Asset | Asset[]) => {
        const assetArray = Array.isArray(assets) ? assets : [assets];
        let count = assetArray.length;
        assetArray.forEach(asset => {
            if (asset.children) {
                count += countAssets(asset.children);
            }
        });
        return count;
    };

    const totalAssets = countAssets(assets);
    const displayedAssets = filteredAssets.length > 0 ? countAssets(filteredAssets) : 0;

    const tooggleNode = (id: number) => {
        const newExpanded: Set<number> = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNodes(newExpanded);
    };

    const expandAll = () => {
        const allIds: Set<number> = new Set<number>();
        const collectIds = (assets: Asset | Asset[]) => {
            const assetArray = Array.isArray(assets) ? assets : [assets];
            assetArray.forEach((asset: Asset) => {
                if (asset.children) {
                    allIds.add(asset.id);
                    collectIds(asset.children);
                }
            });
        };
        collectIds(filteredAssets);
        setExpandedNodes(allIds);
    };

    const collapseAll = () => {
        setExpandedNodes(new Set<number>());
    };

    const handleAssetSelect = (asset: Asset) => {
        setSelectedAsset(asset);
        setShowMobileDetails(true);
    };

     if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="text-center">
                        <h3 className="text-red-800 font-medium text-lg mb-2">Error Loading Assets</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <div className={`
                w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col
                ${selectedAsset && showMobileDetails ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-3 sm:p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Asset Monitor</h1>
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`p-2 rounded hover:bg-gray-100 transition-colors ${showFilter ? 'bg-gray-100' : ''
                                }`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>

                    {showFilter && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="flex-1 px-2 sm:px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {allTypes.map((type: string) => (
                                        <option key={type} value={type}>Type {type}</option>
                                    ))}
                                </select>
                                {typeFilter && (
                                    <button
                                        onClick={() => setTypeFilter('')}
                                        className="p-1.5 hover:bg-gray-200 rounded flex-shrink-0"
                                        title="Clear filter"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={expandAll}
                                    className="px-2 sm:px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    Expand All
                                </button>
                                <button
                                    onClick={collapseAll}
                                    className="px-2 sm:px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    Collapse All
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="my-4 px-1 sm:px-2">
                        <div className="relative">
                            <input
                                type="search"
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                        <span>{displayedAssets} of {totalAssets} assets</span>
                        {typeFilter && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded self-start sm:self-auto">
                                Filtered
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredAssets.length > 0 ? (
                        <div className="p-1 sm:p-2">
                            {filteredAssets.map(asset => (
                                <AssetNode
                                  key={asset.id}
                                  asset={asset}
                                  expandedNodes={expandedNodes}
                                  selectedAssetId={selectedAsset?.id ?? null}
                                  onToggleNode={tooggleNode}
                                  onSelect={handleAssetSelect}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No assets match the filter
                        </div>
                    )}
                </div>
            </div>

            <div className={`
                flex-1 overflow-y-auto
                ${selectedAsset && !showMobileDetails ? 'hidden lg:block' : 'block'}
                `}>
                {selectedAsset ? (
                    <AssetDetails
                        asset={selectedAsset}
                        onClose={() => {
                            setSelectedAsset(null);
                            setShowMobileDetails(false);
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center min-h-[50vh] lg:h-full text-gray-400 p-4">
                        <div className="text-center max-w-md">
                            <p className="text-lg sm:text-xl font-medium text-gray-600 mb-2">Asset Monitoring Dashboard</p>
                            <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Select an asset from the tree to view its details</p>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
                                    <div className="text-gray-500 mb-1 text-xs sm:text-sm">Total Assets</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalAssets}</div>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
                                    <div className="text-gray-500 mb-1 text-xs sm:text-sm">Asset Types</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{allTypes.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}