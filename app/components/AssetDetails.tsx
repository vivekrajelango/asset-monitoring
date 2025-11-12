"use client"
import { ChevronLeft, X } from 'lucide-react';
import { Asset, AssetAttribute } from '../types';

type AssetDetailsProps = {
  asset: Asset;
  onClose: () => void;
};

export function AssetDetails({ asset, onClose }: AssetDetailsProps) {
  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="lg:hidden mb-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft size={20} />
          Back to Assets
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {asset.name}
            </h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium self-start sm:self-auto flex-shrink-0">
              Type {asset.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
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
              {asset.id}
            </p>
          </div>

          {asset.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-gray-900 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded border border-gray-200 text-sm sm:text-base">
                {asset.description}
              </p>
            </div>
          )}

          {asset.attributes && asset.attributes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Attributes ({asset.attributes.length})
              </h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="sm:hidden divide-y divide-gray-200 bg-white">
                  {asset.attributes.map((attr: AssetAttribute, idx: number) => (
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
                      {asset.attributes.map((attr: AssetAttribute, idx: number) => (
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

          {asset.children && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Child Assets
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                <span className="text-blue-700 text-sm sm:text-base">
                  This asset has {Array.isArray(asset.children) ? asset.children.length : 1} direct child{Array.isArray(asset.children) && asset.children.length !== 1 ? 'ren' : ''}
                </span>
              </div>
            </div>
          )}

          {!asset.description && (!asset.attributes || asset.attributes.length === 0) && !asset.children && (
            <div className="text-center py-6 sm:py-8 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl sm:text-3xl mb-2">📋</div>
              <p className="text-sm sm:text-base">No additional details available for this asset</p>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Type
            </div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">
              {asset.type}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Attributes
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {asset.attributes?.length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Children
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {asset.children ? (Array.isArray(asset.children) ? asset.children.length : 1) : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}