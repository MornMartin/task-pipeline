import { ReactElement } from 'react';
import style from './index.module.less';
import { EEndpoint, ELineStatus, encodeLineId, ENodeConfigType, ENodeStatus, IAction, IEvent, ILine, INode, INodeConfig, IOutPin, traverseNodesEndpoints } from "@renderer/utils/pipelineDeclares"
import { BezierConnector, BrowserJsPlumbDefaults, EndpointOptions, BrowserJsPlumbInstance, ConnectionTypeDescriptor, Connection } from '@jsplumb/browser-ui';

/**
 * jsPlumb注册端点类型
 */
export type TJsPlumbEndpoint = EEndpoint | 'node';

/**
 * 最小画布缩放
 */
export const minScale = 0.01;

/**
 * 最大画布缩放
 */
export const maxScale = 2;

/**
 * 画布信息定义
 */
export interface ICanvasInfos {
    scale: number;
    scroll: { left: number, top: number }
}

/** 
 * 默认画布缩放/滚动
*/

export const defaultCanvasInfos: ICanvasInfos = { scale: 1, scroll: { left: 10000, top: 10000 } }

/**
 * 获取变化
 * @param source 
 * @param target 
 * @param hasModified 
 * @returns 
 */
const getChanges = function <T>(source: Record<string, T>, target: Record<string, T>, hasModified?: (s: T, t: T) => boolean): { deletes: Record<string, T>, news: Record<string, T>, modifies: Record<string, T> } {
    const sourceCopies = { ...source };
    const targetCopies = { ...target };
    const news: Record<string, T> = {};
    const modifies: Record<string, T> = {};
    for (const key in targetCopies) {
        if (!sourceCopies[key]) {// 原数据中不存在
            news[key] = targetCopies[key];
        } else if (sourceCopies[key] && hasModified?.(sourceCopies[key], targetCopies[key])) {// 原数据中存在，且被判定为已修改
            modifies[key] = targetCopies[key];
            delete sourceCopies[key];
        } else {// 原数据中存在，且被判定为未修改
            delete sourceCopies[key];
        }
    }
    return { deletes: { ...sourceCopies }, news, modifies };
}

/**
 * 获取UI到jsPlumb的变化
 * @param source 
 * @param target 
 * @returns 
 */
export const getChangesForJsPlumb = (source: { nodes: Record<string, INode>, lines: Record<string, ILine> }, target: { nodes: Record<string, INode>, lines: Record<string, ILine> }) => {
    const { nodes: sourceNodes, lines: sourceLines } = source;
    const { events: sourceEvents, actions: sourceActions, outPins: sourceOutPins } = traverseNodesEndpoints(sourceNodes);
    const { nodes: targetNodes, lines: targetLines } = target;
    const { events: targetEvents, actions: targetActions, outPins: targetOutPins } = traverseNodesEndpoints(targetNodes);
    const { deletes: deletedNodes, news: adddedNodes, modifies: modifiedNodes } = getChanges<INode>(sourceNodes, targetNodes);
    const { deletes: deletedLines, news: adddedLines, modifies: modifiedLines } = getChanges<ILine>(sourceLines, targetLines, (source, target) => source.status !== target.status);
    const { deletes: deletedEvents, news: adddedEvents, modifies: modifiedEvents } = getChanges<IEvent>(sourceEvents, targetEvents);
    const { deletes: deletedActions, news: adddedActions, modifies: modifiedActions } = getChanges<IAction>(sourceActions, targetActions);
    const { deletes: deletedOutPins, news: adddedOutPins, modifies: modifiedOutPins } = getChanges<IOutPin>(sourceOutPins, targetOutPins);
    return { deletedNodes, adddedNodes, modifiedNodes, deletedLines, adddedLines, modifiedLines, deletedEvents, adddedEvents, modifiedEvents, deletedActions, adddedActions, modifiedActions, deletedOutPins, adddedOutPins, modifiedOutPins }

}

/**
 * 生成节点UI
 * @param node 
 * @param onActiveHandler 
 * @returns 
 */
export const createNodeUI = (node: INode, onActiveHandler = (e: INode) => { }): ReactElement<any, any> => {
    const { id, styleInfo } = node;
    const { left, top } = styleInfo;
    return (
        <div className={style.node} key={id} id={id} onClick={() => onActiveHandler(node)} style={{ left, top }}>
            <div className={style.nodeTitle}>{node.name}</div>
            {
                node.events?.length ?
                    <div className={style.nodeEvents}>
                        <div className={style.nodeEventTitle}>事件列表</div>
                        <div className={style.nodeEventList}>
                            {
                                node.events.map(event => {
                                    return (
                                        <div className={style.nodeEventItem} key={event.id}>
                                            <span>{event.name}</span>
                                            <span className={style.nodeEndPoint} id={event.id}></span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    : null
            }
            {
                node.actions?.length ?
                    <div className={style.nodeActions}>
                        <div className={style.nodeActionTitle}>动作列表</div>
                        <div className={style.nodeActionList}>
                            {
                                node.actions.map(action => {
                                    return (
                                        <div className={style.nodeActionItemWrap} key={action.id} >
                                            <div className={style.nodeActionItem}>
                                                <span className={style.nodeEndPoint} id={action.id}></span>
                                                <span>{action.name}</span>
                                            </div>
                                            <div className={style.nodeActionOutPinList}>
                                                {
                                                    action.outPins?.map(outPin => {
                                                        return (
                                                            <div className={style.nodeOutPinItem} key={outPin.id}>
                                                                <span>{outPin.name}</span>
                                                                <span className={style.nodeEndPoint} id={outPin.id}></span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    : null
            }
        </div>
    )
}

/**
 * 生成JsPlumb默认配置项
 * @param container 
 * @returns 
 */
export const createJsPlumbDefaults = (container: Element): BrowserJsPlumbDefaults => {
    return {
        container,// 容器节点
        maxConnections: -1,// 最多支持连线数量 -1：无限制
        reattachConnections: false,// 连线是否可以重定向
        connectionsDetachable: false,// 连线是否可以断开
        connector: BezierConnector.type,// 连线类型
    }
}

/**
 * 生成连线配置项
 * @param type 
 * @returns 
 */
const generateConnectorOptions = (type: ELineStatus): ConnectionTypeDescriptor => {
    switch (type) {
        case ELineStatus.default: {
            return {
                cssClass: style.connectorDefault,
                overlays: []
            }
        }
        case ELineStatus.invalid: {
            return {
                cssClass: style.connectorInvalid,
                overlays: []
            }
        }
        case ELineStatus.active: {
            return {
                cssClass: style.connectorActive,
                overlays: []
            }
        }
        case ELineStatus.defaultWithParam: {
            return {
                cssClass: style.connectorDefault,
                overlays: [
                    { type: 'Label', options: { location: 0.5, label: '', cssClass: style.connectorOverlayDefault } }
                ]
            }
        }
        case ELineStatus.invalidWithParam: {
            return {
                cssClass: style.connectorInvalid,
                overlays: [
                    { type: 'Label', options: { location: 0.5, label: '', cssClass: style.connectorOverlayInvalid } }
                ]
            }
        }
        case ELineStatus.activeWithParam: {
            return {
                cssClass: style.connectorActive,
                overlays: [
                    { type: 'Label', options: { location: 0.5, label: '', cssClass: style.connectorOverlayActive } }
                ]
            }
        }
        default: {
            return {}
        }
    }
}

/**
 * 注册连线类型
 * @param jsPlumb 
 * @returns 
 */
export const registerConnectorTypes = (jsPlumb: BrowserJsPlumbInstance) => {
    return jsPlumb.registerConnectionTypes({
        [ELineStatus.default]: generateConnectorOptions(ELineStatus.default),
        [ELineStatus.invalid]: generateConnectorOptions(ELineStatus.invalid),
        [ELineStatus.active]: generateConnectorOptions(ELineStatus.active),
        [ELineStatus.defaultWithParam]: generateConnectorOptions(ELineStatus.defaultWithParam),
        [ELineStatus.invalidWithParam]: generateConnectorOptions(ELineStatus.invalidWithParam),
        [ELineStatus.activeWithParam]: generateConnectorOptions(ELineStatus.activeWithParam),
    })
}

/**
 * 基础端点配置项
 */
const baseEndpointOptions: EndpointOptions = {
    endpoint: 'Dot',
    anchor: 'Center',
    paintStyle: { fill: '#ee000000' },
    connectorClass: style.connectorDefault,
    connectorHoverClass: style.connectorHover,
}

/**
 * 生成端点配置项
 * @param type 
 * @returns 
 */
const generateEndpointOptions = (type: TJsPlumbEndpoint): EndpointOptions => {
    switch (type) {
        case 'node': {
            return { endpoint: 'Dot', source: false, target: false, paintStyle: { fill: '#00000000' } }
        }
        case EEndpoint.event: {
            return { ...baseEndpointOptions, source: true, target: false }
        }
        case EEndpoint.action: {
            return { ...baseEndpointOptions, source: false, target: true }
        }
        case EEndpoint.outPin: {
            return { ...baseEndpointOptions, source: true, target: false }
        }
        default: {
            return {}
        }
    }
}

/**
 * 注册端点
 * @param jsPlumb 
 * @param id 
 * @param options 
 * @returns 
 */
export const registerEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string, options: EndpointOptions) => {
    return jsPlumb.addEndpoint(document.getElementById(id) as Element, options);
}

/**
 * 销毁端点
 * @param jsPlumb 
 * @param id 
 * @returns 
 */
export const unregisterEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return jsPlumb.removeAllEndpoints(document.getElementById(id) as Element, false);
}

/**
 * 注册节点拖拽
 * @param jsPlumb 
 * @param id 
 * @returns 
 */
export const registerNodeEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions('node'));
}

/**
 * 注册event端点
 * @param jsPlumb 
 * @param id 
 * @returns 
 */
export const registerEventEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.event));
}

/**
 * 注册action端点
 * @param jsPlumb 
 * @param id 
 * @returns 
 */
export const registerActionEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.action));
}

/**
 * 注册outPin端点
 * @param jsPlumb 
 * @param id 
 * @returns 
 */
export const registerOutPinEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.outPin));
}


/**
 * 移除连线
 * @param jsPlumb 
 * @param lineIds 
 * @returns 
 */
export const disconnectLines = (jsPlumb: BrowserJsPlumbInstance, lineIds: string[]) => {
    const lineIdMap = {};
    for (const lineId of lineIds) {
        lineIdMap[lineId] = true;
    }
    const connections = jsPlumb.getConnections() as Array<Connection>;// 当前版本查询连线得通过端点DOM，极不合理
    for (const item of connections) {
        const lineId = encodeLineId(item.sourceId, item.targetId);
        if (lineIdMap[lineId]) {
            jsPlumb.deleteConnection(item);
            delete lineIdMap[lineId];
            if (!Object.keys(lineIdMap).length) {
                return;
            }
        }
    }
}

/**
 * 添加连线
 * @param jsPlumb 
 * @param lineIds 
 */
export const reconnectLines = (jsPlumb: BrowserJsPlumbInstance, lines: Record<string, ILine>) => {
    jsPlumb.batch(() => {
        for (const lineId in lines) {
            const { sourceId, targetId, status } = lines[lineId];
            jsPlumb.connect({
                source: document.getElementById(sourceId) as Element,
                target: document.getElementById(targetId) as Element,
                connector: BezierConnector.type,
                anchor: baseEndpointOptions.anchor,
                endpoint: baseEndpointOptions.endpoint,
                endpointStyle: baseEndpointOptions.paintStyle,
                cssClass: baseEndpointOptions.connectorClass,
                hoverClass: baseEndpointOptions.connectorHoverClass,
                type: status,
            })
        }
    })
}

/**
 * 计算节点状态
 */
export const getNodeStatus = (isInvalid: boolean, isActive: boolean): ENodeStatus => {
    if (isInvalid) {// 无效
        return ENodeStatus.error;
    }
    if (isActive) {// 激活
        return ENodeStatus.active
    }
    // 未激活
    return ENodeStatus.normal
}

/**
 * 编码节点状态
 * @param actives 
 * @returns 
 */
export const encodeNodeStatus = (actives: INodeConfig[] = [], nodes: Record<string, INode>) => {
    const temp: Record<string, ENodeStatus> = {};
    const activeNodes: Record<string, boolean> = {};
    for (const item of actives) {
        if (item.type === ENodeConfigType.eventNode) {
            activeNodes[item.payload.id] = true;
        }
    }
    for (const nodeId in nodes) {
        const { status } = nodes[nodeId];
        const isInvalid = [ENodeStatus.error].includes(status);
        const isActive = activeNodes[nodeId];
        temp[nodeId] = getNodeStatus(isInvalid, isActive);
    }
    return temp;
}

/**
 * 计算连线状态
 */
export const getLineStatus = (isInvalid: boolean, isParametric: boolean, isActive: boolean): ELineStatus => {
    if (isInvalid && isParametric) {// 无效，有参数
        return ELineStatus.invalidWithParam
    }
    if (isInvalid && !isParametric) {// 无效，无参数
        return ELineStatus.invalid
    }
    if (isActive && isParametric) {// 激活，有参数
        return ELineStatus.activeWithParam
    }
    if (isActive && !isParametric) {// 激活，无参数
        return ELineStatus.active
    }
    if (isParametric) {// 未激活，有参数
        return ELineStatus.defaultWithParam
    }
    // 未激活，无参数
    return ELineStatus.default
}

/**
 * 编码连线状态
 * @param actives 
 * @returns 
 */
export const encodeLineStatus = (actives: INodeConfig[] = [], lines: Record<string, ILine>) => {
    const temp: Record<string, ELineStatus> = {};
    const activeLines: Record<string, boolean> = {};
    for (const item of actives) {
        if (item.type === ENodeConfigType.eventLine) {
            activeLines[item.payload.id] = true;
        }
    }
    for (const lineId in lines) {
        const { status } = lines[lineId];
        const isInvalid = [ELineStatus.invalid, ELineStatus.invalidWithParam].includes(status);
        const isParametric = [ELineStatus.activeWithParam, ELineStatus.defaultWithParam, ELineStatus.invalidWithParam].includes(status);
        const isActive = activeLines[lineId];
        temp[lineId] = getLineStatus(isInvalid, isParametric, isActive);
    }
    return temp;
}

/**
 * 生成节点状态注入样式
 * @param nodeStatus 
 * @returns 
 */
export const generateInjectNodeStyels = (nodeStatus: Record<string, ENodeStatus>): string => {
    let temp = '';
    for (const nodeId in nodeStatus) {
        const status = nodeStatus[nodeId];
        if (status === ENodeStatus.normal) continue;
        const isInvalid = status === ENodeStatus.error;
        temp += `
        .${style.node}[id="${nodeId}"] {
            border-color: ${isInvalid ? '#ff8c8e' : '#7c9ebf'};
        }
        .${style.node}[id="${nodeId}"] .${style.nodeTitle} {
            background-color: ${isInvalid ? '#ff8c8e' : '#7c9ebf'};
        }
    `
    }
    return temp;
}

/**
 * 设置连线状态
 * @param lineStatus 
 * @param jsPlumb 
 */
export const setConnectionStatus = (lineStatus: Record<string, ELineStatus>, jsPlumb: BrowserJsPlumbInstance) => {
    const lineStatusTemp = { ...lineStatus };
    jsPlumb.batch(() => {
        const connections = jsPlumb.getConnections() as Connection[] || [];
        for (const connection of connections) {
            const lineId = encodeLineId(connection.sourceId, connection.targetId);
            connection.setType(lineStatusTemp[lineId] ?? ELineStatus.default);
            delete lineStatusTemp[lineId];
            if (!Object.keys(lineStatusTemp).length) return;
        }
    })
}
