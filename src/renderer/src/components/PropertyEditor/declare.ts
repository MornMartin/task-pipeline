
/**
 * 控件类型枚举
 */
export const enum ECtrlType {
    Base = 'Base',
    Input = 'Input',
    InputNumber = 'InputNumber',
    TextArea = 'TextArea',
    Checkbox = 'Checkbox',
    ColorPicker = 'ColorPicker',
    DatePicker = 'DatePicker',
    TimePicker = 'TimePicker',
    Radio = 'Radio',
    Slider = 'Slider',
    Switch = 'Switch',
    CollapseSwitch = 'CollapseSwitch',
    Select = 'Select',

    Divider = 'Divider',

    Collapse = 'Collapse',
    Flex = 'Flex',
    Grid = 'Grid',

    List = 'List',
}

/**
 * 属性定义（字段定义）
 */
export interface IPropertyDefineField {
    name: string;
    type: ECtrlType | 'String' | 'Number' | 'Boolean' | 'Object' | 'Array' | (ECtrlType | 'String' | 'Number' | 'Boolean' | 'Object' | 'Array')[];
    isRequire: boolean;
    description: string;
    children?: Record<string, IPropertyDefineField>;
}

/**
 * 属性定义
 */
export interface IPropertyDefineData {
    ctrl: { name: string, describe: string },
    example: Record<string, any>,
    describe: Record<string, any>,
}

/**
 * 输入控件参数定义
 */
export type TPropertyParam<T> = T | ((propertyDefine: TPropertyDefine, propertyValues: Record<string, any>, injects: Record<string, any>) => T);

/**
 * 输入控件基础定义
 */
export interface IPropertyBase {
    key: string;
    label?: string;
    tip?: string;
    type: ECtrlType;
    isElevated?: boolean;// 是否提升层级
    params?: Record<string, TPropertyParam<any>>;// 控件参数
}

const describeKeyField = '字段绑定名称';
const describeLabelField = '字段显示名称';
const describeTipField = '字段提示内容';
const desrcibeTypeField = '控件类型';
const describeIsElevated = '是否提升字段写入层级。该控件绑定字段会提升至父级定义isElevated为true的结构，遇到数组时，提升至数组子对象；若未有父级定义isElevated为true，则提升至顶层结构。';
const describeParams = '控件配置参数';

const desrcibeDefaultField = '默认值';
const desrcibePlaceholderField = '输入为空时显示文本';
const desrcibeDisabledField = '是否禁用';
const desrcibeMaxlengthField = '最大输入字符数';
const describeOptionsField = '选项列表。结构为：{value: string, label: string}[]';
const describeAllowClearField = '是否可以清空值';

const propertyBaseDefineExample: IPropertyDefineData['example'] = {
    key: '',
    label: '',
    tip: '',
    type: ECtrlType.Base,
    isElevated: false,
    params: {}
}

const propertyBaseDefineDescribe: IPropertyDefineData['describe'] = {
    key: describeKeyField,
    label: describeLabelField,
    tip: describeTipField,
    type: desrcibeTypeField,
    isElevated: describeIsElevated,
    params: describeParams,
}

/**
 * 文本框输入控件定义
 */
export interface IPropertyInput extends IPropertyBase {
    type: ECtrlType.Input | ECtrlType.TextArea,
    params?: {
        default?: TPropertyParam<string | number>;
        placeholder?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;
        maxlength?: TPropertyParam<number>;
    }
}

const propertyInputDescribe: IPropertyDefineData['ctrl'] = {
    name: "文本框",
    describe: ""
}

const propertyInputDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Input,
    params: {
        default: '',
        placeholder: '',
        disabled: false,
        maxlength: Infinity,
    }
}

const propertyInputDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        disabled: desrcibeDisabledField,
        maxlength: desrcibeMaxlengthField,
    }
}

const propertyInputDefineData: IPropertyDefineData = {
    ctrl: propertyInputDescribe,
    example: propertyInputDefineExample,
    describe: propertyInputDefineDescribe,
}

/**
 * 文本域输入控件定义
 */
export interface IPropertyTextArea extends IPropertyInput {
    type: ECtrlType.TextArea,
    params?: IPropertyInput['params'] & {
        resize?: TPropertyParam<'none' | 'horizontal'>;
    }
}

const propertyTextAreaDescribe: IPropertyDefineData['ctrl'] = {
    name: "文本域",
    describe: ""
}

const propertyTextAreaDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.TextArea,
    params: {
        ...propertyBaseDefineExample.params,
        resize: 'vertical',
    }
}

const propertyTextAreaDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        ...propertyBaseDefineDescribe.params,
        resize: '是否可改变大小。none：不可改变大小；vertical：垂直方向可改变大小；',
    }
}

const propertyTextAreaDefineData: IPropertyDefineData = {
    ctrl: propertyTextAreaDescribe,
    example: propertyTextAreaDefineExample,
    describe: propertyTextAreaDefineDescribe,
}

/**
 * 数字输入框控件定义
 */
export interface IPropertyInputNumber extends IPropertyBase {
    type: ECtrlType.InputNumber,
    params?: {
        default?: TPropertyParam<number>;
        placeholder?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;

        min?: TPropertyParam<number>;
        max?: TPropertyParam<number>;
        precision?: TPropertyParam<number>;
        controls?: TPropertyParam<boolean>;
    }
}


const propertyInputNumberDescribe: IPropertyDefineData['ctrl'] = {
    name: "数字输入框",
    describe: ""
}

const propertyInputNumberDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.InputNumber,
    params: {
        default: 0,
        placeholder: '',
        disabled: false,
        min: -Infinity,
        max: Infinity,
        precision: Infinity,
        controls: true,
    }
}

const propertyInputNumberDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        disabled: desrcibeDisabledField,
        min: '定义可输入最小值',
        max: '定义可输入最大值',
        precision: '精度',
        controls: '是否显示加减控制按钮',
    }
}

const propertyInputNumberDefineData: IPropertyDefineData = {
    ctrl: propertyInputNumberDescribe,
    example: propertyInputNumberDefineExample,
    describe: propertyInputNumberDefineDescribe,
}

/**
 * 复选框输入控件定义
 */
export interface IPropertyCheckbox extends IPropertyBase {
    type: ECtrlType.Checkbox;
    params?: {
        default?: TPropertyParam<any[]>;
        disabled?: TPropertyParam<boolean>;
        options: TPropertyParam<{ label: any, value: any }[]>;
        layout?: TPropertyParam<'vertical' | 'horizontal'>;
    };
}

const propertyCheckboxDescribe: IPropertyDefineData['ctrl'] = {
    name: "复选框",
    describe: ""
}

const propertyCheckboxDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Checkbox,
    params: {
        default: [],
        disabled: false,
        options: [],
        layout: 'vertical',
    }
}

const propertyCheckboxDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        options: describeOptionsField,
        layout: '布局方式。vertical：垂直；horizontal：水平。',
    }
}

const propertyCheckboxDefineData: IPropertyDefineData = {
    ctrl: propertyCheckboxDescribe,
    example: propertyCheckboxDefineExample,
    describe: propertyCheckboxDefineDescribe,
}

/**
 * 颜色输入控件定义
 */
export interface IPropertyColorPicker extends IPropertyBase {
    type: ECtrlType.ColorPicker;
    params?: {
        default?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;
        allowClear?: TPropertyParam<boolean>;
        format?: TPropertyParam<'rgb' | 'hex' | 'hsb'>;
        mode?: TPropertyParam<'single' | 'gradient' | ('single' | 'gradient')[]>;
    }
}

const propertyColorPickerDescribe: IPropertyDefineData['ctrl'] = {
    name: "颜色选择器",
    describe: ""
}

const propertyColorPickerDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.ColorPicker,
    params: {
        default: '',
        disabled: false,
        allowClear: true,
        format: 'rgb',
        mode: 'single',
    }
}

const propertyColorPickerDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        disabled: desrcibeDisabledField,
        allowClear: describeAllowClearField,
        format: '色值格式。rgb、hex、hsb',
        mode: '选择模式。single：单色；gradient：渐变色，可与single同时设置，通过数组传入。',
    }
}

const propertyColorPickerDefineData: IPropertyDefineData = {
    ctrl: propertyColorPickerDescribe,
    example: propertyColorPickerDefineExample,
    describe: propertyColorPickerDefineDescribe,
}

/**
 * 日期选择器输入控件定义
 */
export interface IPropertyDatePicker extends IPropertyBase {
    type: ECtrlType.DatePicker;
    params?: {
        default?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;
        placeholder?: TPropertyParam<string>;
        allowClear?: TPropertyParam<boolean>;
        mode?: TPropertyParam<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>;
        format?: TPropertyParam<string>;
    }
}


const propertyDatePickerDescribe: IPropertyDefineData['ctrl'] = {
    name: "日期选择器",
    describe: ""
}

const propertyDatePickerDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.DatePicker,
    params: {
        default: '',
        placeholder: '',
        disabled: false,
        allowClear: true,
        mode: 'date',
        format: 'YYYY-MM-DD',
    }
}

const propertyDatePickerDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        disabled: desrcibeDisabledField,
        allowClear: describeAllowClearField,
        mode: '选择模式。time：精确到时间；date：精确到天；week：精确到周（开始时间）；quarter：精确到季度（开始时间）；year：精确到年',
        format: '格式。YYYY-MM-DD HH:mm:ss Y：年，M：月，D：天，H：小时（24时制），h：小时(12时制)，m：分，s：秒'
    }
}

const propertyDatePickerDefineData: IPropertyDefineData = {
    ctrl: propertyDatePickerDescribe,
    example: propertyDatePickerDefineExample,
    describe: propertyDatePickerDefineDescribe,
}

/**
 * 时间选择器输入控件定义
 */
export interface IPropertyTimePicker extends IPropertyBase {
    type: ECtrlType.TimePicker,
    params?: {
        default?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;
        placeholder?: TPropertyParam<string>;
        allowClear?: TPropertyParam<boolean>;
        format?: TPropertyParam<string>;
    }
}


const propertyTimePickerDescribe: IPropertyDefineData['ctrl'] = {
    name: "时间选择器",
    describe: ""
}

const propertyTimePickerDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.TimePicker,
    params: {
        default: '',
        placeholder: '',
        disabled: false,
        allowClear: true,
        format: 'HH:mm:ss',
    }
}

const propertyTimePickerDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        disabled: desrcibeDisabledField,
        allowClear: describeAllowClearField,
        format: '格式。HH:mm:ss H：小时（24时制），h：小时(12时制)，m：分，s：秒',
    }
}

const propertyTimePickerDefineData: IPropertyDefineData = {
    ctrl: propertyTimePickerDescribe,
    example: propertyTimePickerDefineExample,
    describe: propertyTimePickerDefineDescribe,
}

/**
 * 单选框输入控件定义
 */
export interface IPropertyRadio extends IPropertyBase {
    type: ECtrlType.Radio,
    params?: {
        default?: TPropertyParam<any>;
        disabled?: TPropertyParam<boolean>;
        options: TPropertyParam<{ label: any, value: any }[]>;

        isBlock?: TPropertyParam<boolean>;
        optionType?: TPropertyParam<'default' | 'button'>;
        buttonStyle?: TPropertyParam<'outline' | 'solid'>;
    }
}


const propertyRadioDescribe: IPropertyDefineData['ctrl'] = {
    name: "单选框",
    describe: ""
}

const propertyRadioDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Radio,
    params: {
        default: '',
        disabled: false,
        options: [],
        isBlock: true,
        optionType: 'button',
        buttonStyle: 'solid',
    }
}

const propertyRadioDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        disabled: desrcibeDisabledField,
        options: describeOptionsField,
        isBlock: '是否撑满宽度',
        optionType: '设置选项类型，default：圆点；button：按钮',
        buttonStyle: '设置按钮类型，outline：描边；solid：实色填充',
    }
}

const propertyRadioDefineData: IPropertyDefineData = {
    ctrl: propertyRadioDescribe,
    example: propertyRadioDefineExample,
    describe: propertyRadioDefineDescribe,
}

/**
 * 滑动条输入控件定义
 */
export interface IPropertySlider extends IPropertyBase {
    type: ECtrlType.Slider,
    params?: {
        default?: TPropertyParam<number>;
        disabled?: TPropertyParam<boolean>;
        min?: TPropertyParam<number>;
        max?: TPropertyParam<number>;
        step?: TPropertyParam<number>;
    }
}


const propertySliderDescribe: IPropertyDefineData['ctrl'] = {
    name: "滑动条",
    describe: ""
}

const propertySliderDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Slider,
    params: {
        default: 0,
        disabled: false,
        min: -Infinity,
        max: Infinity,
        step: 1,
    }
}

const propertySliderDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        disabled: desrcibeDisabledField,
        min: '最小值',
        max: '最大值',
        step: '步长',
    }
}

const propertySliderDefineData: IPropertyDefineData = {
    ctrl: propertySliderDescribe,
    example: propertySliderDefineExample,
    describe: propertySliderDefineDescribe,
}

/**
 * 开关输入控件定义
 */
export interface IPropertySwitch extends IPropertyBase {
    type: ECtrlType.Switch,
    params?: {
        default?: TPropertyParam<boolean>;
        disabled?: TPropertyParam<boolean>;
    }
}

const propertySwitchDescribe: IPropertyDefineData['ctrl'] = {
    name: "开关",
    describe: ""
}

const propertySwitchDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Switch,
    params: {
        default: false,
        disabled: false,
    }
}

const propertySwitchDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        disabled: desrcibeDisabledField,
    }
}

const propertySwitchDefineData: IPropertyDefineData = {
    ctrl: propertySwitchDescribe,
    example: propertySwitchDefineExample,
    describe: propertySwitchDefineDescribe,
}

/**
 * 下拉选择输入控件定义
 */
export interface IPropertySelect extends IPropertyBase {
    type: ECtrlType.Select,
    params?: {
        default?: TPropertyParam<any>;
        disabled?: TPropertyParam<boolean>;
        placeholder?: TPropertyParam<string>;
        options: TPropertyParam<{ label: any, value: any }[]>;
    }
}

const propertySelectDescribe: IPropertyDefineData['ctrl'] = {
    name: "下拉选择框",
    describe: ""
}

const propertySelectDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Select,
    params: {
        default: '',
        placeholder: '',
        disabled: false,
        options: [],
    }
}

const propertySelectDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
        placeholder: desrcibePlaceholderField,
        disabled: desrcibeDisabledField,
        options: describeOptionsField,
    }
}

const propertySelectDefineData: IPropertyDefineData = {
    ctrl: propertySelectDescribe,
    example: propertySelectDefineExample,
    describe: propertySelectDefineDescribe,
}

/**
 * 折叠控件定义
 */
export interface IPropertyCollapse extends IPropertyBase {
    type: ECtrlType.Collapse,
    children: TPropertyDefine[],
}

const propertyCollapseDescribe: IPropertyDefineData['ctrl'] = {
    name: "折叠面板",
    describe: "定义一个对象。Children的key为该对象的属性字段。"
}

const propertyCollapseDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Collapse,
    children: [],
}

const propertyCollapseDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    children: '对象字段控件，可以是单值，也可以是其他对象或数组。添加CollapseSwitch控件可以为该折叠面板加个开关。',
}

const propertyCollapseDefineData: IPropertyDefineData = {
    ctrl: propertyCollapseDescribe,
    example: propertyCollapseDefineExample,
    describe: propertyCollapseDefineDescribe,
}

/**
 * 折叠控件开关定义
 */
export interface IPropertyCollapseSwitch extends IPropertyBase {
    type: ECtrlType.CollapseSwitch,
    params?: {
        default: TPropertyParam<boolean>;// 是否默认开启
    }
}

const propertyCollapseSwitchDescribe: IPropertyDefineData['ctrl'] = {
    name: "折叠面板开关",
    describe: "为折叠面板添加一个开关。当为同一个折叠面板添加多个开关时，仅最后一个生效。"
}

const propertyCollapseSwitchDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.CollapseSwitch,
    params: {
        default: true,
    }
}

const propertyCollapseSwitchDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
        default: desrcibeDefaultField,
    }
}

const propertyCollapseSwitchDefineData: IPropertyDefineData = {
    ctrl: propertyCollapseSwitchDescribe,
    example: propertyCollapseSwitchDefineExample,
    describe: propertyCollapseSwitchDefineDescribe,
}

/**
 * 分割线控件定义
 */
export interface IPropertyDivider extends IPropertyBase {
    type: ECtrlType.Divider,
    params?: {
        lineColor?: TPropertyParam<string>,
        labelColor?: TPropertyParam<string>,
        type?: TPropertyParam<'horizontal' | 'vertical'>,
        variant?: TPropertyParam<'dashed' | 'dotted' | 'solid'>,
    }
}

const propertyDividerDescribe: IPropertyDefineData['ctrl'] = {
    name: "分割线",
    describe: ""
}

const propertyDividerDefineExample: IPropertyDivider = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Divider,
    key: '',
    params: {
        lineColor: '#ccc',
        labelColor: '#ccc',
        type: 'horizontal',
        variant: 'solid',
    }
}

const propertyDividerDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    key: '应为空',
    params: {
        lineColor: '线条颜色',
        labelColor: '附加文本颜色',
        type: '类型。horizontal：水平分割线；vertical：垂直分割线',
        variant: '线条类型。dashed：线段；dotted：点；solid：实线。',
    }
}

const propertyDividerDefineData: IPropertyDefineData = {
    ctrl: propertyDividerDescribe,
    example: propertyDividerDefineExample,
    describe: propertyDividerDefineDescribe,
}

/**
 * 弹性容器定义
 */
export interface IPropertyFlex extends IPropertyBase {
    type: ECtrlType.Flex,
    children: TPropertyDefine[],
    params?: {

    }
}

const propertyFlexDescribe: IPropertyDefineData['ctrl'] = {
    name: "弹性容器",
    describe: ""
}

const propertyFlexDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Flex,
    params: {
    }
}

const propertyFlexDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    params: {
    }
}

const propertyFlexDefineData: IPropertyDefineData = {
    ctrl: propertyFlexDescribe,
    example: propertyFlexDefineExample,
    describe: propertyFlexDefineDescribe,
}

/**
 * 网格容器定义
 */
export interface IPropertyGrid extends IPropertyBase {
    type: ECtrlType.Grid,
    children: TPropertyDefine[],
    params?: {

    }
}


const propertyGridDescribe: IPropertyDefineData['ctrl'] = {
    name: "网格容器",
    describe: ""
}

const propertyGridDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.Grid,
    children: [],
    params: {
    }
}

const propertyGridDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    children: [],
    params: {
    }
}

const propertyFlexGridDefineData: IPropertyDefineData = {
    ctrl: propertyGridDescribe,
    example: propertyGridDefineExample,
    describe: propertyGridDefineDescribe,
}

/**
 * 列表容器定义
 */
export interface IPropertyList extends IPropertyBase {
    type: ECtrlType.List,
    children: [TPropertyDefine],
    params?: {
        default?: TPropertyParam<any[]>;
    }
}


const propertyListDescribe: IPropertyDefineData['ctrl'] = {
    name: "列表容器",
    describe: "定义一个数组。"
}

const propertyListDefineExample: IPropertyDefineData['example'] = {
    ...propertyBaseDefineExample,
    type: ECtrlType.List,
    children: [],
    params: {
        default: [],
    }
}

console.log(propertyListDefineExample)

const propertyListDefineDescribe: IPropertyDefineData['describe'] = {
    ...propertyBaseDefineDescribe,
    children: '数组的子项，有且仅有一项。可以为对象或单值。',
    params: {
        default: desrcibeDefaultField,
    }
}

const propertyListDefineData: IPropertyDefineData = {
    ctrl: propertyListDescribe,
    example: propertyListDefineExample,
    describe: propertyListDefineDescribe,
}

/**
 * 对象容器控件
 */
export const objectContainerCtrls: ECtrlType[] = [ECtrlType.Collapse, ECtrlType.Flex, ECtrlType.Grid];

/**
 * 数组容器控件
 */
export const arrayContainerCtrls: ECtrlType[] = [ECtrlType.List];

/**
 * 输入控件定义
 */
export type TPropertyDefine = IPropertyInput | IPropertyGrid | IPropertyInputNumber | IPropertyColorPicker | IPropertyCheckbox | IPropertyDatePicker | IPropertyTimePicker | IPropertyRadio | IPropertySlider | IPropertySwitch | IPropertySelect | IPropertyCollapse | IPropertyCollapseSwitch | IPropertyDivider | IPropertyFlex | IPropertyGrid | IPropertyList;


export interface IRenderPropertyDefine {
    id: string;
    ctrl: TPropertyDefine,
    path: TPropertyDefine[],
    parents: TPropertyDefine[],
    children?: IRenderPropertyDefine[],
}

export const propertyDefineDatas: IPropertyDefineData[] = [
    propertyInputDefineData,
    propertyTextAreaDefineData,
    propertyInputNumberDefineData,
    propertyColorPickerDefineData,
    propertyDatePickerDefineData,
    propertyTimePickerDefineData,
    propertyRadioDefineData,
    propertyCheckboxDefineData,
    propertySliderDefineData,
    propertySwitchDefineData,
    propertySelectDefineData,
    propertyCollapseDefineData,
    propertyCollapseSwitchDefineData,
    propertyDividerDefineData,

    propertyFlexDefineData,
    propertyFlexGridDefineData,
    propertyListDefineData,
]
