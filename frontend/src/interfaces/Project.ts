import type {Node, Edge} from "@xyflow/react";

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
    document: DocumentPayload;
    created_at: string;
    updated_at: string;
}

export interface NodeCoordinates {
    x: number;
    y: number;
}

export interface NodeData {
    label: string;
    config: any;
}

export interface DocumentNode extends Record<string, unknown> {
    id: number;
    type: 'start' | 'end' | 'content' | 'question' | 'decision' | 'action'| 'event' | 'wait' | 'error';
    position:NodeCoordinates,
    data:NodeData,
}

export interface DocumentEdge extends Record<string, unknown> {
    id: number;
    source: string;
    target: string;
    sourceHandle: string | null;
    targetHandle: string | null;
    type: string;
}
export interface DocumentViewport {
    x: number;
    y: number;
    zoom: number;
}

export type ProjectNode = Node<DocumentNode>;
export type ProjectEdge = Edge<DocumentEdge>;

export interface ProjectDocument {
    schemaVersion: number;
    nodes: ProjectNode[];
    edges: ProjectEdge[];
    viewport: DocumentViewport;
}

export interface DocumentPayload {
    document_version: number;
    document: ProjectDocument;
}

export interface ProjectResponse {
    status: number;
    statusText: string;
    data: DocumentPayload;
}