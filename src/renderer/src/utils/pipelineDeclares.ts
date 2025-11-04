
/**
 * 端点ID分隔符
 */
export const endpointIdSeparator = '@';

/**
 * 连线ID分隔符
 */
export const lineIdSeparator = '&';

/**
 * 动作/动作输出/事件参数定义
 */
interface IParamDefine {
    key: string;
}

/**
 * 定义端点类型
 */
export const enum EEndpoint {
    event = 'event',
    action = 'action',
    outPin = 'outPin',
}

/**
 * 端点定义基类
 */
interface IEndpoint {
    id: string;
    name: string;
    type: EEndpoint;
    paramDefines?: IParamDefine[];
}

/**
 * 动作定义
 */
export interface IAction extends IEndpoint {
    type: EEndpoint.action,
    outPins?: IOutPin[];
}

/**
 * 事件定义
 */
export interface IEvent extends IEndpoint {
    type: EEndpoint.event,
}


/**
 * 动作输出定义
 */
export interface IOutPin extends IEndpoint {
    type: EEndpoint.outPin,
}

/**
 * 节点类型
 */
export const enum ENodeType {
    test,
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
    name: string;
    type: ENodeType;
    status: ENodeStatus;
    events: IEvent[];
    actions: IAction[];
    styleInfo: { left: number, top: number };
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
    return window.crypto.randomUUID();
}

export const mockNodes = (length: number = 10): Record<string, INode> => {
    const temp = {};
    for (let i = 0; i < length; i++) {
        const id = createNodeId();
        const node: INode = {
            id,
            name: `mock-node-${i || ""}`,
            type: ENodeType.test,
            status: ENodeStatus.normal,
            styleInfo: { left: 10000 + i * 75, top: 10000 + (i % 5) * 50 },
            events: [
                { id: encodeEndpointId(id, 'event'), type: EEndpoint.event, name: 'Event 1', paramDefines: [] },
                { id: encodeEndpointId(id, 'event2'), type: EEndpoint.event, name: 'Event 2', paramDefines: [] },
            ],
            actions: [
                {
                    id: encodeEndpointId(id, 'action'),
                    name: 'Action 1',
                    type: EEndpoint.action,
                    paramDefines: [],
                    outPins: [
                        { id: encodeEndpointId(id, 'action', 'outPin1'), type: EEndpoint.outPin, name: 'OutPin1 1', paramDefines: [] },
                        { id: encodeEndpointId(id, 'action', 'outPin2'), type: EEndpoint.outPin, name: 'OutPin2 1', paramDefines: [] }
                    ]
                },
                {
                    id: encodeEndpointId(id, 'action2'),
                    name: 'Action 2',
                    type: EEndpoint.action,
                    paramDefines: [],
                    outPins: [
                        { id: encodeEndpointId(id, 'action2', 'outPin1'), type: EEndpoint.outPin, name: 'OutPin1 1', paramDefines: [] },
                        { id: encodeEndpointId(id, 'action2', 'outPin2'), type: EEndpoint.outPin, name: 'OutPin2 1', paramDefines: [] }
                    ]
                },
            ],
        }
        temp[id] = node;
    }
    return temp;
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
