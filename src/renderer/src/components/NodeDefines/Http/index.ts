import Properties from './Configs/Properties';
import Events from './Configs/Events';
import Actions from './Configs/Actions';
import { defineNode, ENodeType } from '../declare';

export default defineNode({
    type: ENodeType.http,
    name: 'Http',
    Properties,
    Events,
    Actions,
})