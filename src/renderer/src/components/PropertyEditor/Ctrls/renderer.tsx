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
import Slider from './Slider/index';
import Switch from './Switch/index';
import Divider from './Divider/index';
import DatePicker from './DatePicker/index';
import TimePicker from './TimePicker/index';

import { ECtrlType, IPropertyCheckbox, IPropertyCollapse, IPropertyCollapseSwitch, IPropertyColorPicker, IPropertyDatePicker, IPropertyDivider, IPropertyInput, IPropertyInputNumber, IPropertyList, IPropertyRadio, IPropertySelect, IPropertySlider, IPropertySwitch, IPropertyTextArea, IPropertyTimePicker, IRenderPropertyDefine, TPropertyDefine } from '../declare';

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
const toRenderUndefined = (renderDefine: IRenderPropertyDefine, ctrlDefine: any, isKeyDisabled = false) => {
    return <div key={isKeyDisabled ? undefined : renderDefine.id} style={{ display: 'flex', marginBottom: '8px' }}>
        <Label>{ctrlDefine.label}</Label>
        <div style={{ width: ctrlDefine?.label ? 'var(--ctrl-width)' : '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Undefined {ctrlDefine?.type}</div>
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
const toRenderCheckbox = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyCheckbox, value: (string | number)[], onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Checkbox key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Checkbox>
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
const toRenderInput = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyInput, value: string | number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Input key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Input>
    )
};

/**
 * 渲染分割线
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderDivider = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyDivider, isKeyDisabled = false) => {
    return (
        <Divider key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine}></Divider>
    )
};

/**
 * 渲染日期选择器
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderDatePicker = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyDatePicker, value: string, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <DatePicker key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></DatePicker>
    )
};

/**
 * 渲染时间选择器
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderTimePicker = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyTimePicker, value: string, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <TimePicker key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></TimePicker>
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
const toRenderInputNumber = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyInputNumber, value: number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <InputNumber key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></InputNumber>
    )
};

/**
 * 渲染滑动条
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderSlider = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertySlider, value: number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Slider key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Slider>
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
const toRenderColorPicker = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyColorPicker, value: string, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <ColorPicker key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></ColorPicker>
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
const toRenderSelect = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertySelect, value: string | number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Select key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Select>
    )
};

/**
 * 渲染开关
 * @param renderDefine 
 * @param ctrlDefine 
 * @param value 
 * @param onChange 
 * @returns 
 */
const toRenderSwitch = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertySwitch, value: boolean, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Switch key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Switch>
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
const toRenderRadio = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyRadio, value: string | number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <Radio key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></Radio>
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
const toRenderCollapse = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyCollapse, values: Record<string, any>, onChange: changeHandler, isKeyDisabled = false) => {
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
            key={isKeyDisabled ? undefined : renderDefine.id}
            define={ctrlDefine}
            switchDefine={ctrl as IPropertyCollapseSwitch}
            switchValue={switchValue}
            onChange={onSwitchChange}
        >
            {rest.map(item => toRender(item, values, onChange, false))}
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
const toRenderTextArea = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyTextArea, value: string | number, onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <TextArea key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></TextArea>
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
const toRenderList = (renderDefine: IRenderPropertyDefine, ctrlDefine: IPropertyList, value: any[], onChange: changeHandler, isKeyDisabled = false) => {
    return (
        <List key={isKeyDisabled ? undefined : renderDefine.id} define={ctrlDefine} value={value} onChange={(e) => onChange(e, renderDefine.path)}></List>
    )
};

/**
 * 渲染属性控件
 * @param renderDefine 
 * @param values 
 * @param onChange 
 * @param isKeyDisabled 是否为控件声明key；当被数组调用时，key应写在每一项外层，若控件再声明key会导致更新时重载
 * @returns 
 */
export const toRender = (renderDefine: IRenderPropertyDefine, values: Record<string, any>, onChange: changeHandler, isKeyDisabled = false): JSX.Element => {
    const { ctrl, path } = renderDefine;
    const { type } = ctrl;
    if (type === ECtrlType.Checkbox) {
        return toRenderCheckbox(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Input) {
        return toRenderInput(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.InputNumber) {
        return toRenderInputNumber(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Slider) {
        return toRenderSlider(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Switch) {
        return toRenderSwitch(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.TextArea) {
        return toRenderTextArea(renderDefine, ctrl as IPropertyTextArea, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Radio) {
        return toRenderRadio(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Divider) {
        return toRenderDivider(renderDefine, ctrl, isKeyDisabled);
    }
    if (type === ECtrlType.DatePicker) {
        return toRenderDatePicker(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.TimePicker) {
        return toRenderTimePicker(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.ColorPicker) {
        return toRenderColorPicker(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Select) {
        return toRenderSelect(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    if (type === ECtrlType.Collapse) {
        return toRenderCollapse(renderDefine, ctrl, values, onChange, isKeyDisabled);
    }
    if (type === ECtrlType.List) {
        return toRenderList(renderDefine, ctrl, getPropertyValue(path, values), onChange, isKeyDisabled);
    }
    return toRenderUndefined(renderDefine, ctrl, isKeyDisabled);
}
