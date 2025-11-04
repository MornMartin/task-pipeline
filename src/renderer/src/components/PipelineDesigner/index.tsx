import style from './index.module.less';
import { PauseCircleOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import PipelineCanvas from '@renderer/components/PipelineCanvas';
import { addHotKeyListener, CtrlKey, DeleteKey, EHotKey, generateHotKey } from '@renderer/utils/hotkeys';
import { useMessage } from '@renderer/utils/message';
import { INodeConfig, INode, mockNodes, ILine, IEvent, IAction, decodeLineId, decodeEndpointId, IOutPin, traverseNodesEndpoints, EEndpoint, ENodeConfigType, getNodesDeleteInfos, getNodesCopyInfos, getNodesPasteInfos } from '@renderer/utils/pipelineDeclares';
import { useEffect, useMemo, useRef, useState, createContext } from 'react';
import { useLoaderData, useNavigate } from 'react-router';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const [showMessage, contextHolder] = useMessage();
    const { detail } = useLoaderData();
    const [active, setActive] = useState<INodeConfig[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [nodes, setNodes] = useState<Record<string, INode>>(mockNodes(10));
    const linesRef = useRef<Record<string, ILine>>({});
    const [lines, setLines] = useState<Record<string, ILine>>(linesRef.current);

    const events = useRef<Record<string, IEvent>>({});
    const actions = useRef<Record<string, IAction>>({});
    const outPins = useRef<Record<string, IOutPin>>({});

    const isShowParamPannel = useMemo(() => active.length === 1, [active]);

    const toPlay = () => {
        setIsPlaying(true)
    }

    const toPause = () => {
        setIsPlaying(false);
    }

    const toSave = () => {
        // 
    }

    const toDelete = (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
        const { remainsNodes = {}, remainsLines = {}, deletesNodes = {}, deletesLines = {} } = getNodesDeleteInfos(nodes, lines, selects) || {};
        setNodes(remainsNodes);
        setLines(remainsLines);
    }

    const toCopy = async (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
        try {
            const data = getNodesCopyInfos(nodes, lines, selects);
            await window.navigator.clipboard.writeText(JSON.stringify(data));
            showMessage('复制成功', 'success');
        } catch (err: any) {
            showMessage(`复制失败: ${err?.message ?? err}`, 'error');
        }
    }

    const toPaste = async (nodes: Record<string, INode>, lines: Record<string, ILine>) => {
        try {
            const data = await window.navigator.clipboard.readText();
            const { copyNodes, copyLines, copyNodeIds } = JSON.parse(data);
            const { pasteNodes, pasteLines, idChanges } = getNodesPasteInfos(copyNodes, copyLines, copyNodeIds);
            setNodes({ ...nodes, ...pasteNodes });
            setLines({ ...lines, ...pasteLines });
            console.log(pasteNodes, pasteLines, idChanges);
            showMessage('粘贴成功', 'success');
        } catch (err: any) {
            showMessage(`粘贴失败: ${err?.message ?? err}`, 'error');
        }
    }

    /**
     * 连线建立时
     * @param e 
     */
    const onConnectionEstablish = (e: ILine) => {
        // console.log(lines);
        // @todo 传入子组件作为回调函数时：若作为 TSX DOM节点绑定事件函数触发，lines获取的值正确，否则获取的lines会是一个旧值；
        linesRef.current = { ...linesRef.current, [e.id]: e };
        setLines({ ...linesRef.current });
    }

    /**
     * 激活切换时
     * @param e 
     */
    const onActiveChange = (e: INodeConfig[]) => {
        setActive(e);
    }

    useEffect(() => {
        const endpoint = traverseNodesEndpoints(nodes)
        events.current = endpoint.events;
        actions.current = endpoint.actions;
        outPins.current = endpoint.outPins;
    }, [nodes]);

    useEffect(() => {
        linesRef.current = { ...lines };
    }, [lines])

    useEffect(() => {
        const removeCopyListener = addHotKeyListener(generateHotKey(EHotKey.copy), () => toCopy(nodes, lines, active));
        const removePasteListener = addHotKeyListener(generateHotKey(EHotKey.paste), () => toPaste(nodes, lines))
        const removeBackListener = addHotKeyListener(generateHotKey(EHotKey.back), () => {
            console.log('撤销');
        })
        const removeDeleteListener = addHotKeyListener(generateHotKey(EHotKey.delete), () => toDelete(nodes, lines, active));
        return () => {
            removeCopyListener();
            removeBackListener();
            removePasteListener();
            removeDeleteListener();
        };
    }, [nodes, lines, active]);

    return <>
        <div className={style.PipelineDesigner}>
            {contextHolder}
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
