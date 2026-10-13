export interface ProjectListItem {
    id: number;
    name: string;
    owner: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDetail {
    id: number;
    name: string;
    owner: string;
    description: string;
    document: string;
    created_at: string;
    updated_at: string;
}