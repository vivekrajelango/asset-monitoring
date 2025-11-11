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