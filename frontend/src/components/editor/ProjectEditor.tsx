import React, {useCallback, useEffect, useState} from "react";
import {
    useNodesState,
    useEdgesState,
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Connection,
    addEdge, ReactFlowProvider
} from "@xyflow/react";
import type {ProjectEdge, ProjectNode, DocumentPayload} from "../../interfaces/Project.ts";
import NotFound from "../NotFound.tsx";
import {useParams} from "react-router";
import {fetchProject, updateProject} from "../../services/projectService.ts";

import '@xyflow/react/dist/style.css';
import './ProjectEditor.css'

function EditorCanvas({projectId}: {projectId:number}):React.JSX.Element {
    const [nodes, setNodes, onNodesChange] = useNodesState<ProjectNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<ProjectEdge>([]);
    const [payload, setPayload] = useState<DocumentPayload | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [projectName, setProjectName] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function loadProject():Promise<void> {
            try {
                setLoading(true);
                const project = await fetchProject(projectId);
                const data:DocumentPayload = project.document;
                setProjectName(project.name);
                setNodes(data.document.nodes || []);
                setEdges(data.document.edges || []);
                setPayload(data);
            } catch (error:any) {
                if (error.status && error.status == 404)
                {
                    setError('Project not found');
                } else {
                    setError(`There was an error fetching project. ${error}`);
                }
            } finally {
                setLoading(false);
            }
        }
        void loadProject()
    }, [projectId, setNodes, setEdges]);

    const onConnect = useCallback(
        (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    const handleSaveLayout = async () => {
        if (!payload) {
            console.error("No payload to send to server.")
            return;
        }

        const updatedPayload:DocumentPayload = {
            ...payload,
            document: {
                ...payload.document,
                nodes: nodes,
                edges: edges,
            }
        }

        try {
            const response = await updateProject(projectId, updatedPayload);
            if (response.status !== 200) {
                alert(`Failed to save project: ${response.status}, ${response.statusText}`)
            } else {
                setPayload({
                    ...updatedPayload,
                    document_version: response.data.document_version,
                });
                alert(`Project updated successfully to version ${response.data.document_version}.`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading canvas layout...</div>;
    }

    if (error) {
        return <div className="error"> {error} </div>;
    }

    return (
        <div className="editor-layout-wrapper">
            {/* Top action bar overlay */}
            <header className="canvas-action-header">
                <h2>{projectName}</h2>
                <button onClick={handleSaveLayout} className="btn-primary">
                    Save Layout
                </button>
            </header>

            {/* Main Canvas Viewport container */}
            <div className="canvas-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background color="#cbd5e1" gap={16} size={1}/>
                    <Controls/>
                    <MiniMap nodeStrokeWidth={3} zoomable pannable/>
                </ReactFlow>
            </div>
        </div>
    );
}

export default function ProjectEditor():React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    if (!id) return <NotFound/>;

    const projectId = parseInt(id);
    if (isNaN(projectId)) return <NotFound/>;

    return (
        <ReactFlowProvider>
            <EditorCanvas projectId={projectId} />
        </ReactFlowProvider>
    );
}