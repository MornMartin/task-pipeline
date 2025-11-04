import { ReactElement } from 'react';
import style from './index.module.less';
import { decodeLineId, EEndpoint, ELineStatus, encodeLineId, ENodeConfigType, IAction, IEvent, ILine, INode, INodeConfig, IOutPin, traverseNodesEndpoints } from "@renderer/utils/pipelineDeclares"
import { BezierConnector, BrowserJsPlumbDefaults, EndpointOptions, BrowserJsPlumbInstance, ConnectionTypeDescriptor, Connection } from '@jsplumb/browser-ui';

export type TEndpoint = EEndpoint | 'node';

export const defaultScale = 1;

export const minScale = 0.01;

export const maxScale = 2;

export interface IStatus {
    isActive?: boolean;
    isInvalid?: boolean;
    isParametric?: boolean;
}

const getChanges = function <T>(source: Record<string, T>, target: Record<string, T>, hasModified?: (s: T, t: T) => boolean): { deletes: Record<string, T>, news: Record<string, T>, modifies: Record<string, T> } {
    const sourceCopies = { ...source };
    const targetCopies = { ...target };
    const news: Record<string, T> = {};
    const modifies: Record<string, T> = {};
    for (const key in targetCopies) {
        if (!sourceCopies[key]) {// 原数据中不存在
            news[key] = targetCopies[key];
        } else if (sourceCopies[key] && hasModified?.(sourceCopies[key], targetCopies[key])) {// 原数据中存在，且被判定为已修改
            modifies[key] = targetCopies[key]
        } else {// 原数据中存在，且被判定为未修改
            delete sourceCopies[key];
        }
    }
    return { deletes: { ...sourceCopies }, news, modifies };
}

export const getChangesForJsPlumb = (source: { nodes: Record<string, INode>, lines: Record<string, ILine> }, target: { nodes: Record<string, INode>, lines: Record<string, ILine> }) => {
    const { nodes: sourceNodes, lines: sourceLines } = source;
    const { events: sourceEvents, actions: sourceActions, outPins: sourceOutPins } = traverseNodesEndpoints(sourceNodes);
    const { nodes: targetNodes, lines: targetLines } = target;
    const { events: targetEvents, actions: targetActions, outPins: targetOutPins } = traverseNodesEndpoints(targetNodes);
    const { deletes: deletedNodes, news: adddedNodes, modifies: modifiedNodes } = getChanges<INode>(sourceNodes, targetNodes);
    const { deletes: deletedLines, news: adddedLines, modifies: modifiedLines } = getChanges<ILine>(sourceLines, targetLines);
    const { deletes: deletedEvents, news: adddedEvents, modifies: modifiedEvents } = getChanges<IEvent>(sourceEvents, targetEvents);
    const { deletes: deletedActions, news: adddedActions, modifies: modifiedActions } = getChanges<IAction>(sourceActions, targetActions);
    const { deletes: deletedOutPins, news: adddedOutPins, modifies: modifiedOutPins } = getChanges<IOutPin>(sourceOutPins, targetOutPins);
    return { deletedNodes, adddedNodes, modifiedNodes, deletedLines, adddedLines, modifiedLines, deletedEvents, adddedEvents, modifiedEvents, deletedActions, adddedActions, modifiedActions, deletedOutPins, adddedOutPins, modifiedOutPins }

}

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

export const createJsPlumbDefaults = (container: Element): BrowserJsPlumbDefaults => {
    return {
        container,// 容器节点
        maxConnections: -1,// 最多支持连线数量 -1：无限制
        reattachConnections: false,// 连线是否可以重定向
        connectionsDetachable: false,// 连线是否可以断开
        connector: BezierConnector.type,// 连线类型
    }
}

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

const generateEndpointOptions = (type: TEndpoint): EndpointOptions => {
    const baseOptions: EndpointOptions = {
        endpoint: 'Dot',
        anchor: 'Center',
        paintStyle: { fill: '#ee000000' },
        connectorClass: style.connectorDefault,
        connectorHoverClass: style.connectorHover,
    }
    switch (type) {
        case 'node': {
            return { endpoint: 'Dot', source: false, target: false, paintStyle: { fill: '#00000000' } }
        }
        case EEndpoint.event: {
            return { ...baseOptions, source: true, target: false }
        }
        case EEndpoint.action: {
            return { ...baseOptions, source: false, target: true }
        }
        case EEndpoint.outPin: {
            return { ...baseOptions, source: true, target: false }
        }
        default: {
            return {}
        }
    }
}

const registerEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string, options: EndpointOptions) => {
    return jsPlumb.addEndpoint(document.getElementById(id) as Element, options);
}

export const registerNodeEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions('node'));
}

export const registerEventEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.event));
}

export const registerActionEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.action));
}

export const registerOutPinEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpoint.outPin));
}

export const unregisterEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string) => {
    return jsPlumb.removeAllEndpoints(document.getElementById(id) as Element, false);
}

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

export const reconnectLines = (jsPlumb: BrowserJsPlumbInstance, lineIds: string[]) => {
    jsPlumb.batch(() => {
        const connections = jsPlumb.getConnections() as Array<Connection>;// 当前版本查询连线得通过端点DOM，极不合理
        const existedLines = connections.map(item => {
            const { sourceId, targetId } = item;
            return encodeLineId(sourceId, targetId);
        })
        for (const lineId of lineIds.filter(item => !existedLines.includes(item))) {// 添加连线时屏蔽当前已有连线
            const { sourceId, targetId } = decodeLineId(lineId);
            jsPlumb.connect({ source: document.getElementById(sourceId) as Element, target: document.getElementById(targetId) as Element })
        }
    })
}

export const encodeNodeStatus = (actives: INodeConfig[] = []) => {
    const temp: Record<string, IStatus> = {};
    for (const item of actives) {
        if (item.type === ENodeConfigType.eventNode) {
            temp[item.payload.id] = { isActive: true };
        }
    }
    return temp;
}

export const encodeLineStatus = (actives: INodeConfig[] = []) => {
    const temp: Record<string, IStatus> = {};
    for (const item of actives) {
        if (item.type === ENodeConfigType.eventLine) {
            temp[item.payload.id] = { isActive: true };
        }
    }
    return temp;
}

export const generateInjectNodeStyels = (nodeStatus: Record<string, IStatus>): string => {
    let temp = '';
    for (const nodeId in nodeStatus) {
        const { isActive, isInvalid } = nodeStatus[nodeId];
        if (!(isActive || isInvalid)) continue;
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

export const setConnectionStatus = (lineStatus: Record<string, IStatus>, jsPlumb: BrowserJsPlumbInstance) => {
    jsPlumb.batch(() => {
        const connections = jsPlumb.getConnections() as Connection[] || [];
        for (const connection of connections) {
            const lineId = encodeLineId(connection.sourceId, connection.targetId);
            const { isActive, isInvalid, isParametric } = lineStatus[lineId] || {};
            if (isInvalid && isParametric) {// 无效，有参数
                connection.setType(ELineStatus.invalidWithParam);
                continue;
            }
            if (isInvalid && !isParametric) {// 无效，无参数
                connection.setType(ELineStatus.invalid);
                continue;
            }
            if (isActive && isParametric) {// 激活，有参数
                connection.setType(ELineStatus.activeWithParam);
                continue;
            }
            if (isActive && !isParametric) {// 激活，无参数
                connection.setType(ELineStatus.active);
                continue;
            }
            if (isParametric) {// 未激活，有参数
                connection.setType(ELineStatus.defaultWithParam);
                continue;
            }
            // 未激活，无参数
            connection.setType(ELineStatus.default);
        }
    })

}
