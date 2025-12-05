import { TPropertyDefine } from "@renderer/components/PropertyEditor/declare";
import { createUUID } from "@renderer/utils/methods";
import { analysePropertyDefine, createMockPropertyDefine, decodePropertyDefineJson, encodePropertyDefineJson } from "@renderer/components/PropertyEditor/methods";
import { ac } from "node_modules/react-router/dist/development/context-DSyS5mLj.mjs";

/**
 * 端点ID分隔符
 */
export const endpointIdSeparator = '@';

/**
 * 连线ID分隔符
 */
export const lineIdSeparator = '&';

/**
 * 定义端点类型
 */
export const enum EEndpoint {
    event = 'event',
    action = 'action',
    outPin = 'outPin',
}

/**
 * 事件参数定义
 */
export interface IEventParamDefine {
    key: string;
    label: string;
    tip?: string;
}

/**
 * 端点定义基类
 */
interface IEndpoint {
    id: string;
    label: string;
    type: EEndpoint;
}

/**
 * 动作定义
 */
export interface IAction extends IEndpoint {
    type: EEndpoint.action,
    outPins?: IOutPin[];
    paramDefines?: TPropertyDefine[];
}

/**
 * 事件定义
 */
export interface IEvent extends IEndpoint {
    type: EEndpoint.event,
    paramDefines?: IEventParamDefine[];
}


/**
 * 动作输出定义
 */
export interface IOutPin extends IEndpoint {
    type: EEndpoint.outPin,
    paramDefines?: IEventParamDefine[];
}

/**
 * 节点类型
 */
export const enum ENodeType {
    test,
    http,
}

/**
 * 节点/动作状态
 */
export const enum ENodeStatus {
    normal,
    loading,
    warning,
    success,
    error,
    active,
}

/**
 * 连线状态
 */
export const enum ELineStatus {
    default = 'default',
    invalid = 'invalid',
    active = 'active',
    defaultWithParam = 'defaultWithParam',
    invalidWithParam = 'invalidWithParam',
    activeWithParam = 'activeWithParam',
}

/**
 * 节点定义
 */
export interface INode {
    id: string;
    label: string;
    type: ENodeType;
    status: ENodeStatus;
    events: IEvent[];
    actions: IAction[];
    params?: Record<string, any>;
    paramDefines?: TPropertyDefine[];
    styleInfo: { left: number, top: number };
}

/**
 * 节点模板定义
 */
export interface INodeDefine {
    name: string, type: ENodeType, Properties: TPropertyDefine[], Events: IEvent[], Actions: IAction[]
}

/**
 * 连线定义
 */
export interface ILine {
    id: string;
    sourceId: string;
    targetId: string;
    status: ELineStatus;
    params?: Record<string, any>;
}

/**
 * 配置面板选中类型
 */
export const enum ENodeConfigType {
    eventNode = "EVENT_NODE",
    eventLine = "EVENT_Line",
}

/**
 * 配置面板选中参数
 */
export interface INodeConfig {
    type: ENodeConfigType,
    payload: {
        id: string;
        sourceId?: string;
        targetId?: string;
    }
}

/**
 * 编码端点ID
 * @param nodeId 
 * @param eventActionId 
 * @param outPinId 
 * @returns 
 */
export const encodeEndpointId = (nodeId: string, eventActionId: string, outPinId?: string): string => {
    if (outPinId) {
        return [outPinId, eventActionId, nodeId].join(endpointIdSeparator);
    }
    return [eventActionId, nodeId].join(endpointIdSeparator);
}

/**
 * 解码端点ID
 * @param id 
 * @returns 
 */
export const decodeEndpointId = (id: string): { nodeId: string, eventActionId: string, outPinId?: string } => {
    const [nodeId, eventActionId, outPinId] = id.split(endpointIdSeparator).reverse();
    return { nodeId, eventActionId, outPinId };
}

/**
 * 编码连线ID
 * @param sourceId 
 * @param targetId 
 * @returns 
 */
export const encodeLineId = (sourceId: string, targetId: string): string => {
    return [sourceId, targetId].join(lineIdSeparator);
}

/**
 * 解码连线ID
 * @param lineId 
 * @returns 
 */
export const decodeLineId = (lineId: string): { sourceId: string, targetId: string } => {
    const [sourceId, targetId] = lineId.split(lineIdSeparator);
    return { sourceId, targetId };
}

export const createNodeId = () => {
    return createUUID();
}

export const defineNode = (node: INodeDefine): INodeDefine => {
    return node;
}

export const defineEvent = (event: Omit<IEvent, 'type'>): IEvent => {
    return { ...event, type: EEndpoint.event };
}

export const defineAction = (action: Omit<IAction, 'type'>, outPins?: Omit<IOutPin, 'type'>[]): IAction => {
    return { ...action, type: EEndpoint.action, outPins: (outPins || []).map(item => defineOutPin(item)) };
}

export const defineOutPin = (outPin: Omit<IOutPin, 'type'>): IOutPin => {
    return { ...outPin, type: EEndpoint.outPin };
}

export const encodeNodeDefineJson = (node: INodeDefine): string => {
    const { Properties, Actions } = node;
    return JSON.stringify({
        ...node, Properties: encodePropertyDefineJson(Properties), Actions: Actions.map(item => {
            return { ...item, paramDefines: item.paramDefines ? encodePropertyDefineJson(item.paramDefines) : item.paramDefines }
        })
    })
}

export const decodeNodeDefineJson = (node: string): INodeDefine | null => {
    try {
        const nodeDefine = JSON.parse(node);
        const { Properties, Actions } = nodeDefine;
        return {
            ...nodeDefine, Properties: decodePropertyDefineJson(Properties), Actions: Actions.map(item => {
                return { ...item, paramDefines: item.paramDefines ? decodePropertyDefineJson(item.paramDefines) : item.paramDefines }
            })
        }
    } catch (err) {
        return null;
    }
}

export const createNodeByDefine = (nodeDefine: INodeDefine, position?: { left: number, top: number }): INode => {
    const id = createNodeId();
    return {
        id,
        type: nodeDefine.type,
        label: nodeDefine.name,
        status: ENodeStatus.normal,
        paramDefines: nodeDefine.Properties,
        params: analysePropertyDefine(nodeDefine.Properties).defaults,
        styleInfo: { left: position?.left || 0, top: position?.top || 0 },
        events: nodeDefine.Events.map(item => {
            return { ...item, id: encodeEndpointId(id, item.id) }
        }),
        actions: nodeDefine.Actions.map(action => {
            return {
                ...action, id: encodeEndpointId(id, action.id), outPins: action.outPins?.map(outPin => {
                    return { ...outPin, id: encodeEndpointId(id, action.id, outPin.id) }
                })
            }
        })
    }
}


export const mockNodes = (length: number = 10): Record<string, INode> => {
    const temp = {};
    for (let i = 0; i < length; i++) {
        const id = createNodeId();
        const node: INode = createMockNode(id, `mock-node-${i}`, { left: 10000 + (i % 5) * 250, top: 10000 + i * 50 })
        const params = analysePropertyDefine(node.paramDefines).defaults;
        temp[id] = { ...node, params };
    }
    return temp;
}

export const createMockNode = (id: string, label = 'mock-node', position?: { left: number, top: number }): INode => {
    return {
        id,
        label,
        type: ENodeType.test,
        status: ENodeStatus.normal,
        styleInfo: { left: position?.left || 0, top: position?.top || 0 },
        paramDefines: createMockPropertyDefine(),
        events: [
            { id: encodeEndpointId(id, 'event'), type: EEndpoint.event, label: 'Event 1', paramDefines: [] },
            { id: encodeEndpointId(id, 'event2'), type: EEndpoint.event, label: 'Event 2', paramDefines: [] },
        ],
        actions: [
            {
                id: encodeEndpointId(id, 'action'),
                label: 'Action With Param',
                type: EEndpoint.action,
                paramDefines: createMockPropertyDefine(),
                outPins: [
                    { id: encodeEndpointId(id, 'action', 'outPin1'), type: EEndpoint.outPin, label: 'OutPin1 1', paramDefines: [] },
                    { id: encodeEndpointId(id, 'action', 'outPin2'), type: EEndpoint.outPin, label: 'OutPin2 1', paramDefines: [] }
                ]
            },
            {
                id: encodeEndpointId(id, 'action2'),
                label: 'Action Without Param',
                type: EEndpoint.action,
                outPins: [
                    { id: encodeEndpointId(id, 'action2', 'outPin1'), type: EEndpoint.outPin, label: 'OutPin1 1', paramDefines: [] },
                    { id: encodeEndpointId(id, 'action2', 'outPin2'), type: EEndpoint.outPin, label: 'OutPin2 1', paramDefines: [] }
                ]
            },
        ],
    } as INode;
}


export const traverseNodesEndpoints = (nodes: Record<string, INode>) => {
    const eventsTemp: Record<string, IEvent> = {};
    const actionsTemp: Record<string, IAction> = {};
    const outPinsTemp: Record<string, IOutPin> = {};
    for (const key in nodes) {
        const { events = [], actions = [] } = nodes[key];
        for (const event of events) {
            eventsTemp[event.id] = event;
        }
        for (const action of actions) {
            actionsTemp[action.id] = action;
            const { outPins = [] } = action;
            for (const outPin of outPins) {
                outPinsTemp[outPin.id] = outPin;
            }
        }
    }
    return { events: eventsTemp, actions: actionsTemp, outPins: outPinsTemp }
}

const decodeNodeConfigList = (selects: INodeConfig[]) => {
    const selectNodes: string[] = [];
    const selectLines: string[] = [];
    for (const item of selects) {
        if (item.type === ENodeConfigType.eventLine) {
            selectLines.push(item.payload.id)
        } else if (item.type === ENodeConfigType.eventNode) {
            selectNodes.push(item.payload.id);
        }
    }
    return { selectNodes, selectLines };
}

export const getNodesDeleteInfos = (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
    if (!selects.length) return null;
    const { selectNodes, selectLines } = decodeNodeConfigList(selects);
    const remainsNodes: Record<string, INode> = {};
    const remainsLines: Record<string, ILine> = {};
    const deletesNodes: Record<string, INode> = {};
    const deletesLines: Record<string, ILine> = {};
    for (const id in nodes) {
        if (!selectNodes.includes(id)) {
            remainsNodes[id] = nodes[id];
        } else {
            deletesNodes[id] = nodes[id];
        }
    }
    for (const id in lines) {
        const { sourceId, targetId } = decodeLineId(id);
        const { nodeId: sourceNodeId } = decodeEndpointId(sourceId);
        const { nodeId: targetNodeId } = decodeEndpointId(targetId);
        if (remainsNodes[sourceNodeId] && remainsNodes[targetNodeId] && !selectLines.includes(id)) {
            remainsLines[id] = lines[id];
        } else {
            deletesLines[id] = lines[id];
        }
    }
    return { remainsNodes, remainsLines, deletesNodes, deletesLines }
}

export const getNodesCopyInfos = (nodes: Record<string, INode>, lines: Record<string, ILine>, selects: INodeConfig[]) => {
    const { selectNodes } = decodeNodeConfigList(selects);
    const copyNodeIds: string[] = [];
    const copyNodes: Record<string, INode> = {};
    const copyLines: Record<string, ILine> = {};
    for (const id in nodes) {
        if (selectNodes.includes(id)) {
            copyNodeIds.push(id);
            copyNodes[id] = nodes[id];
        }
    }
    for (const id in lines) {
        const { sourceId, targetId } = decodeLineId(id);
        const { nodeId: sourceNodeId } = decodeEndpointId(sourceId);
        const { nodeId: targetNodeId } = decodeEndpointId(targetId);
        if (selectNodes.includes(sourceNodeId) && selectNodes.includes(targetNodeId)) {// 连线仅可复制节点之间的
            copyLines[id] = lines[id];
        }
    }
    return { copyNodes, copyLines, copyNodeIds };
}

export const getNodesPasteInfos = (copyNodes: Record<string, INode>, copyLines: Record<string, ILine>, copyNodeIds: string[]) => {
    let copyNodesStr = JSON.stringify(copyNodes);
    let copyLinesStr = JSON.stringify(copyLines);
    const idChanges: Record<string, string> = {};
    for (const id of copyNodeIds) {
        const newId = createNodeId();
        const regx = new RegExp(id, 'g');
        idChanges[id] = newId;
        copyNodesStr = copyNodesStr.replaceAll(regx, newId);
        copyLinesStr = copyLinesStr.replaceAll(regx, newId);
    }
    return { pasteNodes: JSON.parse(copyNodesStr), pasteLines: JSON.parse(copyLinesStr), idChanges }
}
