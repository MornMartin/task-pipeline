import style from './index.module.less';
import { PauseCircleOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import PipelineCanvas from '@renderer/components/PipelineCanvas';
import PropertyEditor from '@renderer/components/PropertyEditor';
import { addHotKeyListener, EHotKey, generateHotKey } from '@renderer/utils/hotkeys';
import { useMessage } from '@renderer/utils/message';
import { INodeConfig, INode, mockNodes, ILine, IEvent, IAction, IOutPin, traverseNodesEndpoints, getNodesDeleteInfos, getNodesCopyInfos, getNodesPasteInfos, ENodeConfigType, ELineStatus } from '@renderer/utils/pipelineDeclares';
import { useEffect, useMemo, useRef, useState, createContext } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { encodePropertyDefineJson } from '../PropertyEditor/methods';
import { updatePipelineCanvasInfo } from '@renderer/api';
import { defaultCanvasInfos, ICanvasInfos } from '../PipelineCanvas/declare';
import { IRenderPropertyDefine, TPropertyDefine } from '../PropertyEditor/declare';

interface IProps { }

const Component: React.FC<IProps & Record<string, any>> = (): React.JSX.Element => {
    const [showMessage, contextHolder] = useMessage();
    const { detail } = useLoaderData<{ detail: { id: string, nodes: string, lines: string, variables: string, canvasInfos: string } }>();
    const [active, setActive] = useState<INodeConfig[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const nodesRef = useRef<Record<string, INode>>(detail.nodes ? JSON.parse(detail.nodes) : mockNodes(10));
    const [nodes, setNodes] = useState<Record<string, INode>>(nodesRef.current);
    const linesRef = useRef<Record<string, ILine>>(detail.lines ? JSON.parse(detail.lines) : {});
    const [lines, setLines] = useState<Record<string, ILine>>(linesRef.current);

    const events = useRef<Record<string, IEvent>>({});
    const actions = useRef<Record<string, IAction>>({});
    const outPins = useRef<Record<string, IOutPin>>({});
    const canvasInfos = useRef<ICanvasInfos>(detail?.canvasInfos ? JSON.parse(detail?.canvasInfos) : defaultCanvasInfos);

    //参数配置面板控件参数
    const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});

    const propertyPannelInfos = useMemo(() => {
        if (active.length !== 1) return null;
        const [defaultActive] = active;
        const { type, payload: { id, targetId } } = defaultActive;
        const isConfigNode = type === ENodeConfigType.eventNode;
        const isConfigLine = type === ENodeConfigType.eventLine;
        return { type, id, targetId, isConfigNode, isConfigLine };
    }, [active]);

    /**
     * 参数配置面板控件列表
     */
    const propertyDefines = useMemo<string>(() => {
        if (!propertyPannelInfos) return '';
        const { id, targetId, isConfigNode, isConfigLine } = propertyPannelInfos;
        const paramDefines = (isConfigNode && nodesRef.current[id]?.paramDefines) || (isConfigLine && actions.current[targetId as string]?.paramDefines) || [];
        if (!paramDefines?.length) return '';
        return encodePropertyDefineJson(paramDefines);

    }, [propertyPannelInfos]);

    /**
     * 运行流水线
     */
    const toPlay = () => {
        setIsPlaying(true)
    }

    /**
     * 停止流水线
     */
    const toPause = () => {
        setIsPlaying(false);
    }

    /**
     * 保存流水线
     */
    const toSave = async () => {
        setIsSaving(true);
        try {
            await updatePipelineCanvasInfo(detail.id, { nodes: JSON.stringify(nodes), lines: JSON.stringify(lines), variables: '', canvasInfos: JSON.stringify(canvasInfos.current) });
            showMessage('保存成功', 'success');
        } catch (err: any) {
            showMessage(`保存失败: ${err?.message ?? err}`, 'error');
        }
        setIsSaving(false);
    }

    /**
     * 删除节点/连线
     * @param nodes 
     * @param lines 
     * @param selects 
     */
    const toDelete = (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
        const { remainsNodes = {}, remainsLines = {}, deletesNodes = {}, deletesLines = {} } = getNodesDeleteInfos(nodes, lines, selects) || {};
        const deleteIds = Object.keys(deletesNodes).concat(Object.keys(deletesLines));
        setNodes(remainsNodes);
        setLines(remainsLines);
        setActive(active.filter(item => !deleteIds.includes(item.payload.id)));
    }

    /**
     * 复制节点/连线
     * @param nodes 
     * @param lines 
     * @param selects 
     */
    const toCopy = async (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
        try {
            const data = getNodesCopyInfos(nodes, lines, selects);
            await window.navigator.clipboard.writeText(JSON.stringify(data));
            showMessage('复制成功', 'success');
        } catch (err: any) {
            showMessage(`复制失败: ${err?.message ?? err}`, 'error');
        }
    }

    /**
     * 粘贴节点/连线
     * @param nodes 
     * @param lines 
     */
    const toPaste = async (nodes: Record<string, INode>, lines: Record<string, ILine>) => {
        try {
            const data = await window.navigator.clipboard.readText();
            const { copyNodes, copyLines, copyNodeIds } = JSON.parse(data);
            const { pasteNodes, pasteLines, idChanges } = getNodesPasteInfos(copyNodes, copyLines, copyNodeIds);
            setNodes({ ...nodes, ...pasteNodes });
            setLines({ ...lines, ...pasteLines });
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
        // @todo 传入子组件作为回调函数时：若作为 TSX DOM节点绑定事件函数触发，lines获取的值正确，否则获取的lines会是一个旧值；
        const { targetId } = e;
        const status = actions.current[targetId]?.paramDefines ? ELineStatus.defaultWithParam : ELineStatus.default;
        linesRef.current = { ...linesRef.current, [e.id]: { ...e, status } };
        setLines({ ...linesRef.current });
    }

    /**
     * 节点位置变更时
     * @param node 
     */
    const onNodeStyleChange = (node: INode) => {
        setNodes({ ...nodesRef.current, [node.id]: node });
    }

    /**
     * 激活切换时
     * @param e 
     */
    const onActiveChange = (e: INodeConfig[]) => {
        setActive(e);
    }

    /**
     * 属性配置变更时
     * @param values 
     * @param source 
     */
    const onPropertyChange = (values: Record<string, any>, source: { ctrl: TPropertyDefine, path: TPropertyDefine[], value: any }) => {
        //@todo 通过source做回退
        if (!propertyPannelInfos) return;
        const { id, isConfigNode, isConfigLine } = propertyPannelInfos;
        setPropertyValues(values);
        isConfigNode && setNodes({ ...nodesRef.current, [id]: { ...nodesRef.current[id], params: values } });
        isConfigLine && setLines({ ...linesRef.current, [id]: { ...linesRef.current[id], params: values } });
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
        nodesRef.current = { ...nodes };
    }, [nodes])

    useEffect(() => {
        if (!propertyPannelInfos) return;
        const { id, isConfigNode, isConfigLine } = propertyPannelInfos;
        const defaultValues = isConfigNode && nodesRef.current[id]?.params || isConfigLine && linesRef.current[id]?.params || {};
        setPropertyValues(defaultValues);
    }, [propertyPannelInfos]);

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
            <div className={style.pipelineCanvasWrap} style={{ width: propertyDefines ? 'calc(100% - var(--param-pannel-width))' : '100%' }}>
                <PipelineCanvas
                    nodes={nodes}
                    lines={lines}
                    active={active}
                    configs={canvasInfos.current}
                    onActiveChange={onActiveChange}
                    onConnectionEstablish={onConnectionEstablish}
                    onNodeStyleChange={onNodeStyleChange}
                    onScaleChange={(e) => canvasInfos.current.scale = e}
                    onScrollChange={e => canvasInfos.current.scroll = e}
                >
                </PipelineCanvas>
            </div>
            <div className={style.paramPannel} style={{ width: propertyDefines ? 'var(--param-pannel-width)' : '0' }}>
                {
                    propertyDefines ? <PropertyEditor defines={propertyDefines} values={propertyValues} onChange={onPropertyChange}></PropertyEditor> : null
                }
            </div>
            <div className={style.operations}>
                <PlayCircleOutlined className={`${style.operationItem} ${isPlaying ? style.disabled : ''}`} onClick={isPlaying ? undefined : toPlay} />
                <PauseCircleOutlined className={`${style.operationItem} ${!isPlaying ? style.disabled : ''}`} onClick={isPlaying ? toPause : undefined} />
                <SaveOutlined className={`${style.operationItem} ${isSaving ? style.disabled : ''}`} onClick={isSaving ? undefined : toSave} />
            </div>
        </div>
    </>
}

export default Component;
