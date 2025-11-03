import { useEffect, useMemo, useRef, useState } from 'react'
import { newInstance, BrowserJsPlumbInstance, EVENT_CONNECTION_CLICK, Connection, EVENT_CONNECTION, INTERCEPT_BEFORE_DROP, BeforeDropParams } from "@jsplumb/browser-ui"
import style from './index.module.less'
import { debounce } from '@renderer/utils/methods';
import {
    createJsPlumbDefaults,
    createNodeUI,
    decodeDiffByIds,
    maxScale,
    minScale,
    defaultScale,
    IDiffSources,
    idSetSeparator,
    registerConnectorTypes,
    registerNodeEndpoint,
    registerEventEndpoint,
    registerActionEndpoint,
    registerOutPinEndpoint,
    unregisterEndpoint,
    disconnectLines,
    reconnectLines,
    getChangesForJsPlumb
} from './declare';
import { INode, INodeConfig, ILine, ENodeConfigType, IAction, IEvent, decodeLineId, encodeLineId, ELineStatus } from '@renderer/utils/pipelineDeclares';
import Slider from '../SliderInput';

const initDebounce = debounce();

const emitUIChangesDebounce = debounce(10);

interface IProps {
    nodes: Record<string, INode>;
    lines: Record<string, ILine>;
    active: INodeConfig | null;
    onActiveChange: (e: INodeConfig | null) => void;
    onConnectionEstablish: (e: ILine) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const {
        nodes = {},
        lines = {},
        active,
        onActiveChange,
        onConnectionEstablish,
    } = props;
    const [scale, setScale] = useState(defaultScale);
    const canvasDragStartPos = useRef<{ x: number, y: number }>(null);
    const canvasContainer = useRef<HTMLDivElement>(null);
    const jsPlumbContainer = useRef<HTMLDivElement>(null);
    const jsPlumb = useRef<BrowserJsPlumbInstance>(null);

    const [activeLine, setActiveLine] = useState<string | null>(null);
    const [activeNode, setActiveNode] = useState<string | null>(null);

    const currentUIDatas = useRef<{ nodes: Record<string, INode>, lines: Record<string, ILine> }>({ nodes: {}, lines: {} });
    const targetUIDatas = useRef<{ nodes: Record<string, INode>, lines: Record<string, ILine> }>({ nodes, lines });

    const [cacheNodes, setCacheNodes] = useState<Record<string, INode>>(currentUIDatas.current.nodes);// 用于存储UI更新前节点列表
    const displayNodes = useMemo(() => {// 展示节点列表：缓存节点和新增节点的合集
        return { ...cacheNodes, ...nodes }
    }, [cacheNodes, nodes])

    const injectNodeActiveStyles = useMemo(() => {
        if (!activeNode) return '';
        const styles = `
        .${style.node}[id="${activeNode}"] {
            border-color: #7c9ebf;
        }
        .${style.node}[id="${activeNode}"] .${style.nodeTitle} {
            background-color: #7c9ebf;
        }
        `
        return styles;
    }, [activeNode]);

    /**
     * 监听鼠标按下
     * @param e 
     */
    const onCanvasMouseDown = (e) => {
        const { screenX, screenY } = e;
        canvasDragStartPos.current = { x: screenX, y: screenY };
        const onMouseUp = (e) => {
            // 画布结束拖拽
            canvasDragStartPos.current = null;
            document.removeEventListener('mouseup', onMouseUp);
        }
        document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * 监听鼠标移动
     * @param e 
     * @returns 
     */
    const onCanvasMouseMove = (e) => {
        if (!canvasDragStartPos.current) return;
        // 画布拖拽中
        const { screenX, screenY } = e;
        const { x, y } = { x: canvasDragStartPos.current.x - screenX, y: canvasDragStartPos.current.y - screenY };
        canvasContainer.current?.scrollBy({ left: x, top: y });
        canvasDragStartPos.current = { x: screenX, y: screenY };
    }

    const onCanvasWheel = (e) => {
        const { ctrlKey, deltaY } = e;
        if (!ctrlKey) return;
        // 画布缩放
        const targetScale = Math.max(Math.min(scale - deltaY / 100 * 0.1, maxScale), minScale);
        setScale(Number(targetScale.toFixed(2)));
    }

    const onCanvasClick = (e) => {
        // 非画布空白处点击时忽略
        if (e.target !== jsPlumbContainer.current) return;
        onActiveChange(null);
    }

    const onNodeClick = (e: INode) => {
        onActiveChange({ type: ENodeConfigType.eventNode, payload: { id: e.id } });
    }

    const onLineClick = (e: ILine) => {
        const { id, sourceId, targetId } = e;
        onActiveChange({ type: ENodeConfigType.eventLine, payload: { id, sourceId, targetId } });
    }

    const setNodeIntoView = (node: INode) => {
        const el = document.getElementById(node.id);
        if (!el) return console.error(`Node ${node.id} is not existed.`);
        el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'center' });
    }

    const emitUIChanges = (current: { nodes: Record<string, INode>, lines: Record<string, ILine> }, target: { nodes: Record<string, INode>, lines: Record<string, ILine> }) => {
        if (!jsPlumb.current) return;
        const { deletedLines, deletedOutPins, deletedActions, deletedEvents, deletedNodes, adddedNodes, adddedEvents, adddedActions, adddedOutPins, adddedLines } = getChangesForJsPlumb(current, target);
        jsPlumb.current.batch(() => {
            disconnectLines(jsPlumb.current as BrowserJsPlumbInstance, Object.keys(deletedLines));
            Object.keys(deletedOutPins).forEach(id => {
                unregisterEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(deletedActions).forEach(id => {
                unregisterEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(deletedEvents).forEach(id => {
                unregisterEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(deletedNodes).forEach(id => {
                unregisterEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(adddedNodes).forEach(id => {
                registerNodeEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(adddedEvents).forEach(id => {
                registerEventEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(adddedActions).forEach(id => {
                registerActionEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            Object.keys(adddedOutPins).forEach(id => {
                registerOutPinEndpoint(jsPlumb.current as BrowserJsPlumbInstance, id);
            });
            reconnectLines(jsPlumb.current as BrowserJsPlumbInstance, Object.keys(adddedLines));
        });
        setCacheNodes({ ...target.nodes });
        currentUIDatas.current = { ...target };
    }

    useEffect(() => {
        initDebounce(() => {
            if (!jsPlumbContainer.current) return;
            jsPlumb.current = newInstance(createJsPlumbDefaults(jsPlumbContainer.current));
            jsPlumb.current.setZoom(scale);
            jsPlumb.current.batch(() => {
                registerConnectorTypes(jsPlumb.current as BrowserJsPlumbInstance);
            });
            const [defaultNodeKey] = Object.keys(displayNodes);
            setNodeIntoView(displayNodes[defaultNodeKey]);
            emitUIChangesDebounce(() => emitUIChanges(currentUIDatas.current, targetUIDatas.current));
            jsPlumb.current.bind(INTERCEPT_BEFORE_DROP, (e: BeforeDropParams) => {
                // const { sourceId, targetId } = e;
                return true;
            });
            jsPlumb.current.bind(EVENT_CONNECTION, (c: Connection) => {
                const { sourceId, targetId } = c;
                const lineId = encodeLineId(sourceId, targetId);
                if (lines[lineId]) return;
                onConnectionEstablish(currentUIDatas.current.lines[lineId] = { id: lineId, sourceId, targetId, status: ELineStatus.default });
            });
            jsPlumb.current.bind(EVENT_CONNECTION_CLICK, (c: Connection) => {
                //连线点击
                onLineClick(c as any);
            });
        })
    }, [jsPlumbContainer]);

    useEffect(() => {
        jsPlumb?.current?.setZoom(scale);
        const [defaultNodeKey] = Object.keys(displayNodes);
        setNodeIntoView(displayNodes[defaultNodeKey]);
    }, [scale]);

    useEffect(() => {
        const { type } = active || {};
        const { id } = active?.payload || {};
        setActiveLine(type === ENodeConfigType.eventLine ? id as string : null);
        setActiveNode(type === ENodeConfigType.eventNode ? id as string : null);
    }, [active])

    useEffect(() => {
        for (const connection of (jsPlumb.current?.getConnections() as Connection[] || [])) {
            connection.setType(connection.id === activeLine ? ELineStatus.active : ELineStatus.default);
        }
    }, [activeLine]);

    useEffect(() => {
        targetUIDatas.current = { nodes: { ...nodes }, lines: { ...lines } };
        emitUIChangesDebounce(() => emitUIChanges(currentUIDatas.current, targetUIDatas.current));
    }, [nodes, lines]);

    return <>
        <div className={style.PipelineCanvas} style={{ ['--canvasWidth']: '20000px', '--canvasHeight': '20000px' } as any}>
            <style>{injectNodeActiveStyles}</style>
            <div className={style.canvasWrap} ref={canvasContainer} onWheel={onCanvasWheel} onMouseDown={onCanvasClick}>
                <div
                    className={style.canvas}
                    ref={jsPlumbContainer}
                    onMouseDown={onCanvasMouseDown}
                    onMouseMove={onCanvasMouseMove}
                    style={{
                        transform: `scale(${scale})`,
                        marginRight: `calc(var(--canvasWidth) * (1 - 1 - ${scale}))`,
                        marginBottom: `calc(var(--canvasHeight) * (1 - 1 - ${scale}))`
                    }}
                >
                    {
                        Object.keys(displayNodes).map(key => createNodeUI(displayNodes[key], onNodeClick))
                    }

                </div>
            </div>
            <div className={style.scaleBar}>
                <Slider min={minScale} max={maxScale} value={scale} onChange={setScale}></Slider>
            </div>
        </div>
    </>
}

export default Component;
