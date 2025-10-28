interface IParam {
    key: string;
}
interface IEndpoint {
    id: string;
    name: string;
    params?: IParam[];
}

export interface IAction extends IEndpoint {
    outPins?: IEndpoint[];
}

export interface IEvent extends IEndpoint { }

export const enum ENodeType {
    test,
}

export interface INode {
    id: string;
    name: string;
    type: ENodeType;
    events: IEvent[];
    actions: IAction[];
}

export interface ILine {
    id: string;
    sourceId: string;
    targetId: string;
    params: Record<string, any>;
}

export const enum EActiveType {
    eventNode = "EVENT_NODE",
    eventLine = "EVENT_Line",
}

export interface IActive {
    type: EActiveType,
    payload: {
        id: string;
        sourceId?: string;
        targetId?: string;
    }
}

export const encodeEndpointId = (nodeId: string, eventActionId: string, outPinId?: string): string => {
    if (outPinId) {
        return [outPinId, eventActionId, nodeId].join('@');
    }
    return [eventActionId, nodeId].join('@');
}

export const mockNodes = (length: number = 10): Record<string, INode> => {
    const temp = {};
    for (let i = 0; i < length; i++) {
        const id = window.crypto.randomUUID();
        const node = {
            id,
            name: `mock-node-${i || ""}`,
            type: ENodeType.test,
            events: [
                { id: encodeEndpointId(id, 'event'), name: 'Event 1', params: [] },
                { id: encodeEndpointId(id, 'event2'), name: 'Event 2', params: [] },
            ],
            actions: [
                {
                    id: encodeEndpointId(id, 'action'),
                    name: 'Action 1',
                    params: [],
                    outPins: [
                        { id: encodeEndpointId(id, 'action', 'outPin1'), name: 'OutPin1 1', params: [] },
                        { id: encodeEndpointId(id, 'action', 'outPin2'), name: 'OutPin2 1', params: [] }
                    ]
                },
                {
                    id: encodeEndpointId(id, 'action2'),
                    name: 'Action 2',
                    params: [],
                    outPins: [
                        { id: encodeEndpointId(id, 'action2', 'outPin1'), name: 'OutPin1 1', params: [] },
                        { id: encodeEndpointId(id, 'action2', 'outPin2'), name: 'OutPin2 1', params: [] }
                    ]
                },
            ],
        }
        temp[id] = node;
    }
    return temp;
}