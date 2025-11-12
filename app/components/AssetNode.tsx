"use client"
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Asset, AssetNodeProps } from '../types';

export function AssetNode({
  asset,
  depth = 0,
  expandedNodes,
  selectedAssetId,
  onToggleNode,
  onSelect,
}: AssetNodeProps) {
  const hasChildren = !!asset.children && (
    Array.isArray(asset.children) ? asset.children.length > 0 : true
  );
  const isExpanded = expandedNodes.has(asset.id);
  const isSelected = selectedAssetId === asset.id;

  return (
    <div className="select-none" key={asset.id}>
      <div
        className={`flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-100 rounded transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(asset)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(asset.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
            ? asset.children.map((child) => (
                <AssetNode
                  key={child.id}
                  asset={child}
                  depth={depth + 1}
                  expandedNodes={expandedNodes}
                  selectedAssetId={selectedAssetId ?? null}
                  onToggleNode={onToggleNode}
                  onSelect={onSelect}
                />
              ))
            : (
                <AssetNode
                  key={(asset.children as Asset).id}
                  asset={asset.children as Asset}
                  depth={depth + 1}
                  expandedNodes={expandedNodes}
                  selectedAssetId={selectedAssetId ?? null}
                  onToggleNode={onToggleNode}
                  onSelect={onSelect}
                />
              )}
        </div>
      )}
    </div>
  );
}