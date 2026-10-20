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
import '@xyflow/react/dist/style.css';
import axios from "axios";
import NotFound from "../NotFound.tsx";
import {useParams} from "react-router";
import {fetchProject} from "../../services/projectService.ts";

function EditorCanvas({projectId}: {projectId:number}):React.JSX.Element {
    const [nodes, setNodes, onNodesChange] = useNodesState<ProjectNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<ProjectEdge>([]);
    const [payload, setPayload] = useState<DocumentPayload | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function loadProject():Promise<void> {
            try {
                setLoading(true);
                const project = await fetchProject(projectId);
                const data:DocumentPayload = project.document;
                console.log(data);
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
            const response = await axios.put(`/api/projects/${projectId}/document`, updatedPayload);
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

    return (
        <div className="relative flex h-screen w-screen flex-col bg-slate-50">
            {error ? (<div className="error"> {error} </div>) :
                (
                    <>
                        {/* Top action bar overlay */}
                        <header className="absolute top-4 left-4 z-10 flex gap-2 rounded-lg bg-white p-2 shadow-md">
                            <h1 className="text-sm font-semibold text-slate-700 self-center px-2">Workflow Builder</h1>
                            <button
                                onClick={handleSaveLayout}
                                className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition">
                                Save Layout
                            </button>
                        </header>

                        {/* Main Canvas Viewport container */}
                        <div className="flex-1 w-full h-full">
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
                    </>
                )
            }
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