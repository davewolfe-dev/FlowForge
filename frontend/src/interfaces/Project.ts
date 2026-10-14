export interface ProjectListItem {
    id: number;
    name: string;
    owner: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectItem {
    id: number;
    name: string;
    owner: string;
    description: string;
    document: object;
    created_at: string;
    updated_at: string;
}