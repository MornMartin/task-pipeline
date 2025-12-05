import { useEffect, useMemo, useRef, useState, WheelEventHandler } from 'react'
import { newInstance, BrowserJsPlumbInstance, EVENT_CONNECTION_CLICK, Connection, EVENT_CONNECTION, INTERCEPT_BEFORE_DROP, BeforeDropParams, EVENT_DRAG_STOP } from "@jsplumb/browser-ui"
import style from './index.module.less'
import { debounce } from '@renderer/utils/methods';
import {
    createJsPlumbDefaults,
    createNodeUI,
    maxScale,
    minScale,
    registerConnectorTypes,
    registerNodeEndpoint,
    registerEventEndpoint,
    registerActionEndpoint,
    registerOutPinEndpoint,
    unregisterEndpoint,
    disconnectLines,
    reconnectLines,
    getChangesForJsPlumb,
    encodeNodeStatus,
    encodeLineStatus,
    generateInjectNodeStyels,
    setConnectionStatus,
    ICanvasInfos,
} from './declare';
import { INode, INodeConfig, ILine, ENodeConfigType, encodeLineId, ELineStatus, ENodeStatus } from '@renderer/components/NodeDefines/declare';
import Slider from '../SliderInput';
import { CtrlKey } from '@renderer/utils/hotkeys';

const initJsPlumbDebounce = debounce();

const initScrollDebounce = debounce();

const emitUIChangesDebounce = debounce(10);

interface IProps {
    nodes: Record<string, INode>;
    lines: Record<string, ILine>;
    active: INodeConfig[];
    configs: ICanvasInfos;
    onActiveChange: (e: INodeConfig[]) => void;
    onConnectionEstablish: (e: ILine) => void;
    onNodeStyleChange: (e: INode) => void;
    onScrollChange: (e: ICanvasInfos['scroll']) => void;
    onScaleChange: (e: ICanvasInfos['scale']) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const {
        nodes = {},
        lines = {},
        active,
        configs,
        onActiveChange,
        onConnectionEstablish,
        onNodeStyleChange,
        onScrollChange,
        onScaleChange,
    } = props;
    const [scale, setScale] = useState(configs.scale);
    const canvasDragStartPos = useRef<{ x: number, y: number }>(null);
    const canvasContainer = useRef<HTMLDivElement>(null);
    const canvasScrollInitStatus = useRef<boolean>(false);
    const jsPlumbContainer = useRef<HTMLDivElement>(null);
    const jsPlumb = useRef<BrowserJsPlumbInstance>(null);

    const currentUIDatas = useRef<{ nodes: Record<string, INode>, lines: Record<string, ILine> }>({ nodes: {}, lines: {} });
    const targetUIDatas = useRef<{ nodes: Record<string, INode>, lines: Record<string, ILine> }>({ nodes, lines });

    const [cacheNodes, setCacheNodes] = useState<Record<string, INode>>(currentUIDatas.current.nodes);// 用于存储UI更新前节点列表
    const displayNodes = useMemo(() => {// 展示节点列表：缓存节点和新增节点的合集
        return { ...cacheNodes, ...nodes }
    }, [cacheNodes, nodes])

    const activeRef = useRef<INodeConfig[]>(active);
    const nodeStatus = useMemo<Record<string, ENodeStatus>>(() => encodeNodeStatus(active, nodes), [active, nodes]);
    const lineStatusTemp = useRef<Record<string, ELineStatus>>({});
    const lineStatus = useMemo<Record<string, ELineStatus>>(() => encodeLineStatus(active, lines), [active, lines]);

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

    const onCanvasWheel: WheelEventHandler<HTMLDivElement> = (e) => {
        const { ctrlKey, deltaY } = e;
        if (!ctrlKey) return;
        // 画布缩放
        const targetScale = Math.max(Math.min(scale - deltaY / 100 * 0.1, maxScale), minScale);
        setScale(Number(targetScale.toFixed(2)));
    }

    const onCanvasClick = (e) => {
        // 非画布空白处点击时忽略
        if (e.target !== jsPlumbContainer.current) return;
        // Ctrl按下时，忽略画布空白处点击
        if (CtrlKey.down) return;
        onActiveChange([]);
    }

    /**
     * 节点点击时
     * @param e 
     */
    const onNodeClick = (e: INode) => {
        const { id } = e;
        const isActived = !!active.find(item => item.payload.id === id);
        const currentNodeActive = [{ type: ENodeConfigType.eventNode, payload: { id } }];
        if (CtrlKey.down && isActived) {
            onActiveChange(active.filter(item => item.payload.id !== id));
        } else if (CtrlKey.down && !isActived) {
            onActiveChange(active.concat(currentNodeActive));
        }
        else {
            onActiveChange(currentNodeActive);
        }
    }

    /**
     * 连线点击时
     * @param e 
     */
    const onLineClick = (e: Connection) => {
        const active = activeRef.current;// 该函数被调用时，作用域中active为旧值（初始值）
        const { sourceId, targetId } = e;
        const id = encodeLineId(sourceId, targetId);
        const isActived = !!active.find(item => item.payload.id === id);
        const currentNodeActive = [{ type: ENodeConfigType.eventLine, payload: { id, sourceId, targetId } }];
        if (CtrlKey.down && isActived) {
            onActiveChange(active.filter(item => item.payload.id !== id));
        } else if (CtrlKey.down && !isActived) {
            onActiveChange(active.concat(currentNodeActive));
        }
        else {
            onActiveChange(currentNodeActive);
        }
    }

    /**
     * 视口滚动时
     * @param e 
     */
    const onCanvasWrapScroll = (e) => {
        onScrollChange({ left: e.target.scrollLeft, top: e.target.scrollTop })
    }

    /**
     * 设置节点滚动到视口
     * @param node 
     * @returns 
     */
    const setNodeIntoView = (node: INode) => {
        // 画布视口未初始化时，禁止触发其他滚动
        if (!canvasScrollInitStatus.current) return;
        const el = document.getElementById(node.id);
        if (!el) return console.error(`Node ${node.id} is not existed.`);
        el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'center' });
    }

    const emitUIChanges = (current: { nodes: Record<string, INode>, lines: Record<string, ILine> }, target: { nodes: Record<string, INode>, lines: Record<string, ILine> }) => {
        if (!jsPlumb.current) return;
        const {
            deletedLines,
            deletedOutPins,
            deletedActions,
            deletedEvents,
            deletedNodes,
            modifiedNodes,
            modifiedEvents,
            modifiedActions,
            modifiedOutPins,
            modifiedLines,
            adddedNodes,
            adddedEvents,
            adddedActions,
            adddedOutPins,
            adddedLines,
        } = getChangesForJsPlumb(current, target);
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
            reconnectLines(jsPlumb.current as BrowserJsPlumbInstance, adddedLines);
        });
        setCacheNodes({ ...target.nodes });
        currentUIDatas.current = { ...target };
    }

    useEffect(() => {
        initJsPlumbDebounce(() => {
            if (!jsPlumbContainer.current) return;
            jsPlumb.current = newInstance(createJsPlumbDefaults(jsPlumbContainer.current));
            jsPlumb.current.setZoom(scale);
            jsPlumb.current.batch(() => {
                registerConnectorTypes(jsPlumb.current as BrowserJsPlumbInstance);
            });
            emitUIChangesDebounce(() => emitUIChanges(currentUIDatas.current, targetUIDatas.current));
            jsPlumb.current.bind(INTERCEPT_BEFORE_DROP, (e: BeforeDropParams) => {
                // const { sourceId, targetId } = e;
                return true;
            });
            jsPlumb.current.bind(EVENT_CONNECTION, (c: Connection) => {
                const { sourceId, targetId } = c;
                const lineId = encodeLineId(sourceId, targetId);
                if (targetUIDatas.current.lines[lineId]) return;
                onConnectionEstablish(currentUIDatas.current.lines[lineId] = { id: lineId, sourceId, targetId, status: ELineStatus.default });
            });
            jsPlumb.current.bind(EVENT_CONNECTION_CLICK, (c: Connection) => {
                //连线点击
                onLineClick(c);
            });
            jsPlumb.current.bind(EVENT_DRAG_STOP, e => {
                for (const item of e.elements) {
                    const nodeId = item.id;
                    const node = nodes[nodeId];
                    onNodeStyleChange(currentUIDatas.current.nodes[nodeId] = { ...node, styleInfo: { ...node.styleInfo, left: item.pos.x, top: item.pos.y } });
                }
            })
        })
    }, [jsPlumbContainer]);

    useEffect(() => {
        initScrollDebounce(() => {// 利用防抖使滚动初始化在scale初始化之后
            if (!canvasContainer.current) return;
            canvasContainer.current.scrollTo(configs.scroll);
            canvasScrollInitStatus.current = true;
        })
    }, [canvasContainer])

    useEffect(() => {
        activeRef.current = active;
    }, [active])

    useEffect(() => {
        jsPlumb?.current?.setZoom(scale);
        const [defaultNodeKey] = Object.keys(displayNodes);
        onScaleChange(scale);
        setNodeIntoView(displayNodes[defaultNodeKey]);
    }, [scale]);

    useEffect(() => {
        if (!jsPlumb.current) return;
        if (JSON.stringify(lineStatusTemp.current) === JSON.stringify(lineStatus)) return;
        setConnectionStatus(lineStatus, jsPlumb.current);
        lineStatusTemp.current = { ...lineStatus };
    }, [lineStatus])

    useEffect(() => {
        targetUIDatas.current = { nodes: { ...nodes }, lines: { ...lines } };
        emitUIChangesDebounce(() => emitUIChanges(currentUIDatas.current, targetUIDatas.current));
    }, [nodes, lines]);

    return <>
        <div className={style.PipelineCanvas} style={{ ['--canvasWidth']: '20000px', '--canvasHeight': '20000px' } as any}>
            <style>{generateInjectNodeStyels(nodeStatus)}</style>
            <div className={style.canvasWrap} ref={canvasContainer} onWheel={onCanvasWheel} onMouseDown={onCanvasClick} onScroll={onCanvasWrapScroll}>
                <div
                    className={style.canvas}
                    ref={jsPlumbContainer}
                    data-is-pipeline-canvas="true"
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
