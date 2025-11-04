import style from './index.module.less';
import { PauseCircleOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import PipelineCanvas from '@renderer/components/PipelineCanvas';
import { INodeConfig, INode, mockNodes, ILine, IEvent, IAction, decodeLineId, decodeEndpointId, IOutPin, traverseNodesEndpoints, EEndpoint } from '@renderer/utils/pipelineDeclares';
import { useEffect, useMemo, useRef, useState, createContext } from 'react';
import { useLoaderData, useNavigate } from 'react-router';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const { detail } = useLoaderData();
    const [active, setActive] = useState<INodeConfig | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [nodes, setNodes] = useState<Record<string, INode>>(mockNodes(10));
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

    /**
     * 连线建立时
     * @param e 
     */
    const onConnectionEstablish = (e: ILine) => {
        // console.log(lines);
        // @todo 传入子组件作为回调函数时：若作为 TSX DOM节点绑定事件函数触发，lines获取的值正确，否则获取的lines会是一个旧值；
        linesRef.current = { ...linesRef.current, [e.id]: e };
        setLines(linesRef.current);
    }

    /**
     * 激活切换时
     * @param e 
     */
    const onActiveChange = (e: INodeConfig | null) => {
        setActive(e);
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
                    onActiveChange={onActiveChange}
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
