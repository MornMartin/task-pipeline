import { DOMAttributes, MouseEventHandler, ReactElement } from 'react';
import style from './index.module.less';
import { INode } from "@renderer/utils/pipelineDeclares"
import { BezierConnector, BrowserJsPlumbDefaults, EndpointOptions, BrowserJsPlumbInstance, ConnectionTypeDescriptor } from '@jsplumb/browser-ui';
export const createNode = (node: INode, onActiveHandler = (e: INode) => { }): ReactElement<any, any> => {
    return (
        <div className={style.node} key={node.id} id={node.id} onClick={() => onActiveHandler(node)}>
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

export const createDefaults = (container: Element): BrowserJsPlumbDefaults => {
    return {
        container,// 容器节点
        maxConnections: -1,// 最多支持连线数量 -1：无限制
        reattachConnections: false,// 连线是否可以重定向
        connectionsDetachable: false,// 连线是否可以断开
        connector: BezierConnector.type,// 连线类型
    }
}

export const enum EEndpointType {
    node = 'node',
    event = 'event',
    action = 'action',
    outPin = 'outPin',
}

export const enum EConnectorType {
    default = 'default',
    invalid = 'invalid',
    active = 'active',
    defaultWithParam = 'defaultWithParam',
    invalidWithParam = 'invalidWithParam',
    activeWithParam = 'activeWithParam',
}

const generateConnectorOptions = (type: EConnectorType): ConnectionTypeDescriptor => {
    switch (type) {
        case EConnectorType.default: {
            return {
                cssClass: style.connectorDefault,
                overlays: []
            }
        }
        case EConnectorType.invalid: {
            return {
                cssClass: style.connectorInvalid,
                overlays: []
            }
        }
        case EConnectorType.active: {
            return {
                cssClass: style.connectorActive,
                overlays: []
            }
        }
        case EConnectorType.defaultWithParam: {
            return {
                cssClass: style.connectorDefault,
                overlays: [
                    { type: 'Label', options: { location: 0.5, label: '', cssClass: style.connectorOverlayDefault } }
                ]
            }
        }
        case EConnectorType.invalidWithParam: {
            return {
                cssClass: style.connectorInvalid,
                overlays: [
                    { type: 'Label', options: { location: 0.5, label: '', cssClass: style.connectorOverlayInvalid } }
                ]
            }
        }
        case EConnectorType.activeWithParam: {
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
        [EConnectorType.default]: generateConnectorOptions(EConnectorType.default),
        [EConnectorType.invalid]: generateConnectorOptions(EConnectorType.invalid),
        [EConnectorType.active]: generateConnectorOptions(EConnectorType.active),
        [EConnectorType.defaultWithParam]: generateConnectorOptions(EConnectorType.defaultWithParam),
        [EConnectorType.invalidWithParam]: generateConnectorOptions(EConnectorType.invalidWithParam),
        [EConnectorType.activeWithParam]: generateConnectorOptions(EConnectorType.activeWithParam),
    })
}

const generateEndpointOptions = (type: EEndpointType, data: any): EndpointOptions => {
    const baseOptions: EndpointOptions = {
        endpoint: 'Dot',
        anchor: 'Center',
        paintStyle: { fill: '#ee000000' },
        connectorClass: style.connectorDefault,
        connectorHoverClass: style.connectorHover,
    }
    switch (type) {
        case EEndpointType.node: {
            return { endpoint: 'Dot', source: false, target: false, paintStyle: { fill: '#00000000' }, data }
        }
        case EEndpointType.event: {
            return { ...baseOptions, source: true, target: false, data }
        }
        case EEndpointType.action: {
            return { ...baseOptions, source: false, target: true, data }
        }
        case EEndpointType.outPin: {
            return { ...baseOptions, source: true, target: false, data }
        }
        default: {
            return {}
        }
    }
}

const registerEndpoint = (jsPlumb: BrowserJsPlumbInstance, id: string, options: EndpointOptions) => {
    return jsPlumb.addEndpoint(document.getElementById(id) as Element, options);
}

export const registerNodeEndpoints = (jsPlumb: BrowserJsPlumbInstance, node: INode) => {
    registerEndpoint(jsPlumb, node.id, generateEndpointOptions(EEndpointType.node, node));
    const { actions = [], events = [] } = node;
    actions.forEach(action => {
        const { id, outPins = [] } = action;
        registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpointType.action, action));
        outPins?.forEach(outPin => {
            const { id } = outPin;
            registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpointType.outPin, outPin));
        })
    });
    events.forEach(event => {
        const { id } = event;
        registerEndpoint(jsPlumb, id, generateEndpointOptions(EEndpointType.event, event));
    })
}
