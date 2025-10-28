import { useEffect, useMemo, useRef, useState } from 'react'
import { newInstance, BrowserJsPlumbInstance, EVENT_CONNECTION_CLICK, EVENT_ENDPOINT_CLICK, Connection, EVENT_CONNECTION, INTERCEPT_BEFORE_DROP, BeforeDropParams, Endpoint } from "@jsplumb/browser-ui"
import style from './index.module.less'
import { debounce } from '@renderer/utils/methods';
import { createDefaults, createNode, EConnectorType, registerConnectorTypes, registerNodeEndpoints } from './methods';
import { INode, IActive, ILine, EActiveType } from '@renderer/utils/pipelineDeclares';
import Slider from '../SliderInput';

const defaultScale = 1;

const minScale = 0.01;

const maxScale = 2;

const initDebounce = debounce();

interface IProps {
    nodes: Record<string, INode>;
    lines: Record<string, ILine>;
    active: IActive | null;
    onActiveChange: (e: IActive) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { nodes = {}, lines = {}, active, onActiveChange } = props;
    const [scale, setScale] = useState(defaultScale);
    const canvasPointerPos = useRef<{ x: number, y: number }>(null);
    const canvasContainer = useRef<HTMLDivElement>(null);
    const jsPlumbContainer = useRef<HTMLDivElement>(null);
    const jsPlumb = useRef<BrowserJsPlumbInstance>(null);
    const [activeLine, setActiveLine] = useState<string | null>(null);
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [injectNodeStyles, setInjectNodeStyles] = useState<string>('');

    /**
     * 监听鼠标按下
     * @param e 
     */
    const onCanvasMouseDown = (e) => {
        const { screenX, screenY } = e;
        canvasPointerPos.current = { x: screenX, y: screenY };
        const onMouseUp = (e) => {
            // 画布结束拖拽
            canvasPointerPos.current = null;
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
        if (!canvasPointerPos.current) return;
        // 画布拖拽中
        const { screenX, screenY } = e;
        const { x, y } = { x: canvasPointerPos.current.x - screenX, y: canvasPointerPos.current.y - screenY };
        canvasContainer.current?.scrollBy({ left: x, top: y });
        canvasPointerPos.current = { x: screenX, y: screenY };
    }

    const onCanvasWheel = (e) => {
        const { ctrlKey, deltaY } = e;
        if (!ctrlKey) return;
        // 画布缩放
        const targetScale = Math.max(Math.min(scale - deltaY / 100 * 0.1, maxScale), minScale);
        setScale(Number(targetScale.toFixed(2)));
    }

    const onNodeClick = (e: INode) => {
        onActiveChange({ type: EActiveType.eventNode, payload: { id: e.id } });
    }

    const onLineClick = (e: ILine) => {
        const { id, sourceId, targetId } = e;
        onActiveChange({ type: EActiveType.eventLine, payload: { id, sourceId, targetId } });
    }

    const setNodeIntoView = (node: INode) => {
        const el = document.getElementById(node.id);
        if (!el) return console.error(`Node ${node.id} is not existed.`);
        el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'center' });
    }

    useEffect(() => {
        initDebounce(() => {
            if (!jsPlumbContainer.current) return;
            const [defaultNodeKey] = Object.keys(nodes);
            jsPlumb.current = newInstance(createDefaults(jsPlumbContainer.current));
            jsPlumb.current.setZoom(scale);
            jsPlumb.current.batch(() => {
                registerConnectorTypes(jsPlumb.current as BrowserJsPlumbInstance);
                for (const key in nodes) {
                    registerNodeEndpoints(jsPlumb.current as BrowserJsPlumbInstance, nodes[key])
                }
            });
            setNodeIntoView(nodes[defaultNodeKey]);
            jsPlumb.current.bind(INTERCEPT_BEFORE_DROP, (params: BeforeDropParams) => {
                //@todo
                return true;
            });
            jsPlumb.current.bind(EVENT_CONNECTION, (c: Connection) => {
                //@todo
            });
            jsPlumb.current.bind(EVENT_CONNECTION_CLICK, (c: Connection) => {
                //连线点击
                onLineClick(c);
            });
        })
    }, [jsPlumbContainer]);

    useEffect(() => {
        jsPlumb?.current?.setZoom(scale);
        const [defaultNodeKey] = Object.keys(nodes);
        setNodeIntoView(nodes[defaultNodeKey]);
    }, [scale]);

    useMemo(() => {
        const { type } = active || {};
        const { id } = active?.payload || {};
        setActiveLine(type === EActiveType.eventLine ? id as string : null);
        setActiveNode(type === EActiveType.eventNode ? id as string : null);
    }, [active])

    useMemo(() => {
        if (!activeNode) return setInjectNodeStyles('');
        const styles = `
        .${style.node}[id="${activeNode}"] {
            border-color: #7c9ebf;
        }
        .${style.node}[id="${activeNode}"] .${style.nodeTitle} {
            background-color: #7c9ebf;
        }
        `
        setInjectNodeStyles(styles);
    }, [activeNode]);

    useMemo(() => {
        for (const connection of (jsPlumb.current?.getConnections() as Connection[] || [])) {
            connection.setType(connection.id === activeLine ? EConnectorType.active : EConnectorType.default)
        }
    }, [activeLine]);

    return <>
        <div className={style.PipelineCanvas} style={{ ['--canvasWidth']: '20000px', '--canvasHeight': '20000px' } as any}>
            <style>{injectNodeStyles}</style>
            <div className={style.canvasWrap} ref={canvasContainer} onWheel={onCanvasWheel}>
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
                        Object.keys(nodes).map(key => createNode(nodes[key], onNodeClick))
                    }

                </div>
                <div className={style.scaleBar}>
                    <Slider min={minScale} max={maxScale} value={scale} onChange={setScale}></Slider>
                </div>
            </div>
        </div>
    </>
}

export default Component;
