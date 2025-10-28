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

export const encodeEndpointId = (nodeId: string, eventActionId: string, outPinId?: string): string => {
    if (outPinId) {
        return [outPinId, eventActionId, nodeId].join('@');
    }
    return [eventActionId, nodeId].join('@');
}

export const mockNodes = (length: number = 10): INode[] => {
    return new Array(length).fill('').map((item, index) => {
        const id = window.crypto.randomUUID();
        return {
            id,
            name: `mock-node-${index || ""}`,
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
    })
}