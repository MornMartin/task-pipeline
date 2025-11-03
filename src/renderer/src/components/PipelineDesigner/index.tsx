import style from './index.module.less';
import { PauseCircleOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import PipelineCanvas from '@renderer/components/PipelineCanvas';
import { INodeConfig, INode, mockNodes, ILine, IEvent, IAction, decodeLineId, decodeEndpointId, IOutPin, traverseNodesEndpoints, EEndpoint } from '@renderer/utils/pipelineDeclares';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const { detail } = useLoaderData();
    const [active, setActive] = useState<INodeConfig | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const nodesRef = useRef<Record<string, INode>>(mockNodes(10));
    const [nodes, setNodes] = useState<Record<string, INode>>({ ...nodesRef.current });
    const linesRef = useRef<Record<string, ILine>>({});
    const [lines, setLines] = useState<Record<string, ILine>>({});

    const events = useRef<Record<string, IEvent>>({});
    const actions = useRef<Record<string, IAction>>({});
    const outPins = useRef<Record<string, IOutPin>>({});

    const isShowParamPannel = useMemo(() => !!active?.payload?.id, [active]);

    const toPlay = () => {
        setIsPlaying(true)
    }

    const toPause = () => {
        setIsPlaying(false);
    }

    const toSave = () => {
        mockChange()
    }

    const onConnectionEstablish = (e: ILine) => {
        linesRef.current = { ...linesRef.current, [e.id]: e };
        setLines(linesRef.current);
    }

    const mockChange = () => {
        const deleteNodeId = Object.keys(nodes).pop();
        const nodesTemp = {};
        for (const id in nodes) {
            if (id !== deleteNodeId) {
                nodesTemp[id] = nodes[id];
            }
        }
        const linesTemp = {};
        Object.keys(lines).forEach(key => {
            const { sourceId, targetId } = decodeLineId(key);
            const { nodeId: sourceNodeId } = decodeEndpointId(sourceId);
            const { nodeId: targetNodeId } = decodeEndpointId(targetId);
            if (nodesTemp[sourceNodeId] && nodesTemp[targetNodeId]) {
                linesTemp[key] = lines[key];
            }
        })
        setNodes({ ...nodesTemp });
        setLines({ ...linesTemp });
        nodesRef.current = { ...nodesTemp };
        linesRef.current = { ...linesTemp };
    }

    useEffect(() => {
        const endpoint = traverseNodesEndpoints(nodes)
        events.current = endpoint.events;
        actions.current = endpoint.actions;
        outPins.current = endpoint.outPins;
    }, [nodes]);

    return <>
        <div className={style.PipelineDesigner}>
            <div className={style.pipelineCanvasWrap} style={{ width: isShowParamPannel ? 'calc(100% - var(--param-pannel-width))' : '100%' }}>
                <PipelineCanvas
                    nodes={nodes}
                    lines={lines}
                    active={active}
                    onActiveChange={setActive}
                    onConnectionEstablish={onConnectionEstablish}
                >
                </PipelineCanvas>
            </div>
            <div className={style.paramPannel} style={{ width: isShowParamPannel ? 'var(--param-pannel-width)' : '0' }}></div>
            <div className={style.operations}>
                <PlayCircleOutlined className={`${style.operationItem} ${isPlaying ? style.disabled : ''}`} onClick={toPlay} />
                <PauseCircleOutlined className={`${style.operationItem} ${!isPlaying ? style.disabled : ''}`} onClick={toPause} />
                <SaveOutlined className={style.operationItem} onClick={toSave} />
            </div>
        </div>
    </>
}

export default Component;
