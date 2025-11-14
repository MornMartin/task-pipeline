import Collapse from './Collapse/index';
import Checkbox from './Checkbox/index';
import Input from './Input/index';
import Radio from './Radio/index';
import InputNumber from './InputNumber/index';
import TextArea from './TextArea/index';
import List from './List/index';
import Label from './Label/index';
import ColorPicker from './ColorPicker/index';
import Select from './Select/index';

import { ECtrlType, IPropertyCheckbox, IPropertyCollapse, IPropertyCollapseSwitch, IPropertyColorPicker, IPropertyInput, IPropertyInputNumber, IPropertyList, IPropertyRadio, IPropertySelect, IPropertyTextArea, IRenderPropertyDefine, TPropertyDefine } from '../declare';

import { JSX } from 'react';
import { getPropertyValue } from '../methods';
import { bidirectionalFilter } from '@renderer/utils/methods';

type changeHandler = (v: any, path: TPropertyDefine[]) => void;

/**
 * 渲染未定义控件提示
 * @param renderDefine 
 * @param ctrlDefine 
 * @returns 
 */
const toRenderUndefined = (renderDefine: IRenderPropertyDefine, ctrlDefine: any) => {
    return <div key={renderDefine.id} style={{ display: 'flex', marginBottom: '8px' }}>
        <Label>{ctrlDefine.label}</Label>
        <div style={{ width: 'var(--ctrl-width)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Undefined {ctrlDefine?.type}</div>
    </div>
};

/**
 * 渲染复选框
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderCheckbox = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyCheckbox, value: (string | number)[], onChange: changeHandler) => {
    return (
        <Checkbox key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </Checkbox>
    )
};

/**
 * 渲染输入框
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderInput = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyInput, value: string | number, onChange: changeHandler) => {
    return (
        <Input key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </Input>
    )
};


/**
 * 渲染数字框
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderInputNumber = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyInputNumber, value: number, onChange: changeHandler) => {
    return (
        <InputNumber key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </InputNumber>
    )
};

/**
 * 渲染取色器
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderColorPicker = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyColorPicker, value: string, onChange: changeHandler) => {
    return (
        <ColorPicker key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </ColorPicker>
    )
};


/**
 * 渲染下拉选择
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderSelect = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertySelect, value: string | number, onChange: changeHandler) => {
    return (
        <Select key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </Select>
    )
};

/**
 * 渲染单选框
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderRadio = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyRadio, value: string | number, onChange: changeHandler) => {
    return (
        <Radio key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}>
        </Radio>
    )
};

/**
 * 渲染折叠面板
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderCollapse = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyCollapse, values: Record<string, any>, onChange: changeHandler) => {
    const { result: collapseSwitch, rest } = bidirectionalFilter<IRenderPropertyDefine>(renderDefine.children || [], e => e.ctrl.type === ECtrlType.CollapseSwitch);
    const switchRenderDefine = collapseSwitch.pop();
    const { ctrl, path } = switchRenderDefine || {};
    const switchValue = path ? getPropertyValue(path, values) : undefined;
    const onSwitchChange = (e) => {
        if (!path) return;
        onChange(e, path);
    }
    return (
        <Collapse
            key={renderDefine.id}
            define={ctrlDefine}
            switchDefine={ctrl as IPropertyCollapseSwitch}
            switchValue={switchValue}
            onChange={onSwitchChange}
        >
            {rest.map(item => toRender(item, values, onChange))}
        </Collapse>
    )
};

/**
 * 渲染文本域
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderTextArea = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyTextArea, value: string | number, onChange: changeHandler) => {
    return (
        <TextArea key={renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></TextArea>
    )
};

/**
 * 渲染列表
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderList = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyList, value: any[], onChange: changeHandler) => {
    return (
        <List key={renderDefine.id} define={ctrlDefine} value={value} onChange={onChange}></List>
    )
};

/**
 * 渲染属性控件
 * @param renderDefine 
 * @param values 
 * @param onChange 
 * @returns 
 */
export const toRender = (renderDefine: IRenderPropertyDefine, values: Record<string, any>, onChange: changeHandler): JSX.Element => {
    const { ctrl, path } = renderDefine;
    const { type } = ctrl;
    if (type === ECtrlType.Checkbox) {
        return toRenderCheckbox(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.Input) {
        return toRenderInput(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.InputNumber) {
        return toRenderInputNumber(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.TextArea) {
        return toRenderTextArea(renderDefine, ctrl as IPropertyTextArea, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.Radio) {
        return toRenderRadio(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.ColorPicker) {
        return toRenderColorPicker(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.Select) {
        return toRenderSelect(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    if (type === ECtrlType.Collapse) {
        return toRenderCollapse(renderDefine, ctrl, values, onChange);
    }
    if (type === ECtrlType.List) {
        return toRenderList(renderDefine, ctrl, getPropertyValue(path, values), onChange);
    }
    return toRenderUndefined(renderDefine, ctrl);
}

