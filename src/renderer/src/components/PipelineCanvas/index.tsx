import { MouseEventHandler, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ready, newInstance, BrowserJsPlumbInstance, EVENT_CONNECTION_CLICK, Connection, EVENT_CONNECTION, INTERCEPT_BEFORE_DROP, BeforeDropParams } from "@jsplumb/browser-ui"
import { useLoaderData, useNavigate } from 'react-router';
import style from './index.module.less'
import { debounce } from '@renderer/utils/methods';
import { createDefaults, createNode, EConnectorType, registerConnectorTypes, registerNodeEndpoints } from './methods';
import { mockNodes } from '../PipelineNodes/declare';
import Slider from '../SliderInput';

const defaultScale = 1;

const minScale = 0.01;

const maxScale = 2;

const initDebounce = debounce();

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = ({ }): React.JSX.Element => {
    const { detail } = useLoaderData();
    const [nodeDatas, setNodeDatas] = useState(mockNodes(10));
    const [scale, setScale] = useState(defaultScale);
    const canvasPointerPos = useRef<{ x: number, y: number }>(null);
    const nodeViews = useRef<ReactNode[]>(nodeDatas.map(item => createNode(item)));
    const canvasContainer = useRef<HTMLDivElement>(null);
    const jsPlumbContainer = useRef<HTMLDivElement>(null);
    const jsPlumb = useRef<BrowserJsPlumbInstance>(null);
    const onCanvasMouseDown = (e) => {
        const { screenX, screenY } = e;
        canvasPointerPos.current = { x: screenX, y: screenY };
        const onMouseUp = (e) => {
            canvasPointerPos.current = null;
            document.removeEventListener('mouseup', onMouseUp);
        }
        document.addEventListener('mouseup', onMouseUp);
    }
    const onCanvasMouseMove = (e) => {
        if (!canvasPointerPos.current) return;
        const { screenX, screenY } = e;
        const { x, y } = { x: canvasPointerPos.current.x - screenX, y: canvasPointerPos.current.y - screenY };
        canvasContainer.current?.scrollBy({ left: x, top: y });
        canvasPointerPos.current = { x: screenX, y: screenY };
    }

    const onCanvasWheel = (e) => {
        const { ctrlKey, deltaY } = e;
        if (!ctrlKey) return;
        setTimeout(() => {
            const targetScale = Math.max(Math.min(scale - deltaY / 100 * 0.1, maxScale), minScale);
            setScale(Number(targetScale.toFixed(2)));
        })
    }
    useEffect(() => {
        initDebounce(() => {
            if (!jsPlumbContainer.current) return;
            const [defaultNode] = nodeDatas;
            jsPlumb.current = newInstance(createDefaults(jsPlumbContainer.current));
            jsPlumb.current.setZoom(scale);
            jsPlumb.current.batch(() => {
                registerConnectorTypes(jsPlumb.current as BrowserJsPlumbInstance);
                for (const item of nodeDatas) {
                    registerNodeEndpoints(jsPlumb.current as BrowserJsPlumbInstance, item)
                }
            });
            document.getElementById(defaultNode.id)?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'center' });
            jsPlumb.current.bind(INTERCEPT_BEFORE_DROP, (params: BeforeDropParams) => {
                //@todo
                return true;
            });
            jsPlumb.current.bind(EVENT_CONNECTION, (c: Connection) => {
                //@todo
            });
            jsPlumb.current.bind(EVENT_CONNECTION_CLICK, (c: Connection) => {
                //@todo
                if (c.hasType(EConnectorType.defaultWithParam)) {
                    c.setType(EConnectorType.invalidWithParam)
                } else {
                    c.setType(EConnectorType.defaultWithParam)
                }
            });
        })
    }, [jsPlumbContainer]);
    useEffect(() => {
        jsPlumb?.current?.setZoom(scale);
        const [defaultNode] = nodeDatas;
        document.getElementById(defaultNode.id)?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'center' });
    }, [scale]);
    return <>
        <div className={style.PipelineCanvas} style={{ ['--canvasWidth']: '20000px', '--canvasHeight': '20000px' } as any}>
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
                    {nodeViews.current}

                </div>
                <div className={style.scaleBar}>
                    <Slider min={minScale} max={maxScale} value={scale} onChange={setScale}></Slider>
                </div>
            </div>
        </div>
    </>
}

export default Component;
