"use client"
import { useMemo, useState } from 'react';
import { useAssetFetch } from './hooks/useAssetFetch';
import { ChevronRight, ChevronLeft, ChevronDown, Filter, X } from 'lucide-react';
// import { rawData } from './data';
import { Asset, AssetAttribute } from './api/models';

export default function AssetMonitoringUI() {
    const { assets, loading, error, refetch } = useAssetFetch();
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [typeFilter, setTypeFilter] = useState<string>('');
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
    }, []);

    const filterAssets = (assets: Asset[]): Asset[] | null => {
        const assetArray = Array.isArray(assets) ? assets : [assets];
        console.log('assetArray', assetArray);
        if (!typeFilter) return assetArray;

        const filtered: Asset[] = [];

        assetArray.forEach((asset: Asset) => {
            const matchesFilter: boolean = asset.type === typeFilter;
            let filteredChildren = null;

            if (asset.children) {
                const assetChildArray = Array.isArray(asset.children) ? asset.children : [asset.children]
                filteredChildren = filterAssets(assetChildArray);
            }

            if (matchesFilter || (filteredChildren && filteredChildren.length > 0)) {
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
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNodes(newExpanded);
    };

    const expandAll = () => {
        const allIds = new Set();
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
        setExpandedNodes(new Set());
    };

    const handleAssetSelect = (asset: Asset) => {
        setSelectedAsset(asset);
        setShowMobileDetails(true);
    };

    const renderAssetTree = (asset: Asset, depth = 0) => {
        const hasChildren = asset.children && (
            Array.isArray(asset.children) ? asset.children.length > 0 : true
        );
        const isExpanded = expandedNodes.has(asset.id);
        const isSelected = selectedAsset?.id === asset.id;

        return (
            <div key={asset.id} className="select-none">
                <div
                    className={`flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-100 rounded transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => handleAssetSelect(asset)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                tooggleNode(asset.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} />
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-4 sm:w-5 flex-shrink-0" />}

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {asset.name}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium self-start sm:self-auto flex-shrink-0">
                            Type {asset.type}
                        </span>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {Array.isArray(asset.children)
                            ? asset.children.map((child: Asset) => renderAssetTree(child, depth + 1))
                            : renderAssetTree(asset.children as Asset, depth + 1)}
                    </div>
                )}
            </div>
        );
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
                            {filteredAssets.map(asset => renderAssetTree(asset))}
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
                    <div className="p-3 sm:p-6 lg:p-8">
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => {
                                    setSelectedAsset(null);
                                    setShowMobileDetails(false);
                                }}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                                <ChevronLeft size={20} />
                                Back to Assets
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                        {selectedAsset.name}
                                    </h2>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium self-start sm:self-auto flex-shrink-0">
                                        Type {selectedAsset.type}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedAsset(null);
                                        setShowMobileDetails(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded transition-colors self-end sm:self-auto flex-shrink-0"
                                    title="Close details"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Asset ID
                                    </h3>
                                    <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 inline-block text-sm sm:text-base break-all">
                                        {selectedAsset.id}
                                    </p>
                                </div>

                                {selectedAsset.description && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Description
                                        </h3>
                                        <p className="text-gray-900 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded border border-gray-200 text-sm sm:text-base">
                                            {selectedAsset.description}
                                        </p>
                                    </div>
                                )}

                                {selectedAsset.attributes && selectedAsset.attributes.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Attributes ({selectedAsset.attributes.length})
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="sm:hidden divide-y divide-gray-200 bg-white">
                                                {selectedAsset.attributes.map((attr: AssetAttribute, idx: number) => (
                                                    <div key={idx} className="p-3 hover:bg-gray-50 transition-colors">
                                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                                            {attr.key}
                                                        </div>
                                                        <div className="text-sm text-gray-700 font-mono break-all">
                                                            {attr.value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="hidden sm:block">
                                                <table className="w-full">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Key
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Value
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {selectedAsset.attributes.map((attr: AssetAttribute, idx: number) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                    {attr.key}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700 font-mono break-all">
                                                                    {attr.value}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedAsset.children && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Child Assets
                                        </h3>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                                            <span className="text-blue-700 text-sm sm:text-base">
                                                This asset has {Array.isArray(selectedAsset.children) ? selectedAsset.children.length : 1} direct child{Array.isArray(selectedAsset.children) && selectedAsset.children.length !== 1 ? 'ren' : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!selectedAsset.description && (!selectedAsset.attributes || selectedAsset.attributes.length === 0) && !selectedAsset.children && (
                                    <div className="text-center py-6 sm:py-8 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-2xl sm:text-3xl mb-2">📋</div>
                                        <p className="text-sm sm:text-base">No additional details available for this asset</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Type
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                                    {selectedAsset.type}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Attributes
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">
                                    {selectedAsset.attributes?.length || 0}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Children
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {selectedAsset.children ? (Array.isArray(selectedAsset.children) ? selectedAsset.children.length : 1) : 0}
                                </div>
                            </div>
                        </div>
                    </div>
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