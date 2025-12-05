import Properties from './Configs/Properties';
import Events from './Configs/Events';
import Actions from './Configs/Actions';
import { defineNode, encodeNodeDefineJson, ENodeType } from '../declare';

export default encodeNodeDefineJson(defineNode({
    type: ENodeType.http,
    name: 'HTTP',
    Properties,
    Events,
    Actions,
}))