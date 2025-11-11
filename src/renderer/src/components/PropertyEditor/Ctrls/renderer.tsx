import Collapse from './Collapse/index';
import Input from './Input/index';
import TextArea from './TextArea/index';
import List from './List/index';

import { ECtrlType, IPropertyCollapse, IPropertyInput, IPropertyList, IPropertyTextArea, IRenderPropertyDefine, TPropertyDefine } from '../declare';

import { JSX } from 'react';
import { getPropertyValue } from '../methods';

type changeHandler = (v: any, path: TPropertyDefine[]) => void;

const toRenderUndefined = (renderDefine: IRenderPropertyDefine, ctrlDefine: any) => {
    return <div key={renderDefine.id}>{ctrlDefine.label}：Undefined ctrl {renderDefine.ctrl.type}</div>
};

const toRenderInput = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyInput, value: string | number, onChange: changeHandler) => {
    return (
        <Input key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </Input>
    )
};

const toRenderCollapse = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyCollapse, value: Record<string, any>, onChange: changeHandler) => {
    return (
        <Collapse key={renderDefine.id} define={ctrlDefine}>{renderDefine.children?.map(item => toRender(item, value, onChange))}</Collapse>
    )
};

const toRenderTextArea = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyTextArea, value: string | number, onChange: changeHandler) => {
    return (
        <TextArea key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></TextArea>
    )
};

const toRenderList = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyList, value: any[], onChange: changeHandler) => {
    return (
        <List key={renderDefine.id} define={ctrlDefine} value={value} onChange={onChange}></List>
    )
};

export const toRender = (renderDefine: IRenderPropertyDefine, values: Record<string, any>, onChange: changeHandler): JSX.Element => {
    const { ctrl, path } = renderDefine;
    const { type } = ctrl;
    if (type === ECtrlType.Input) {
        return toRenderInput(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.TextArea) {
        return toRenderTextArea(renderDefine, ctrl as IPropertyTextArea, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.Collapse) {
        return toRenderCollapse(renderDefine, ctrl, values, onChange);
    }
    if (type === ECtrlType.List) {
        return toRenderList(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    return toRenderUndefined(renderDefine, ctrl);
}

