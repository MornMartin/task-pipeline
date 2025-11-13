
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
    name: string;
    type: ECtrlType | string;
    description?: string;
    fields: Record<string, IPropertyDefineField>;
}

const describeKeyField = '字段绑定名称';
const describeLabelField = '字段显示名称';
const describeTipField = '字段提示内容';
const desrcibeTypeField = '控件类型';
const describeIsElevated = '是否提升字段写入层级';

const desrcibeDefaultField = '默认值';
const desrcibePlaceholderField = '输入为空时显示文本';
const desrcibeDisabledField = '是否禁用';
const desrcibeMaxlengthField = '最大输入字符数';

const createDefineField = (name: string, type: IPropertyDefineField['type'], description = '', isRequire = false, children?): IPropertyDefineField => {
    return { name, type, isRequire, description, children }
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

const describeBase: IPropertyDefineData = {
    name: '基础控件',
    type: 'Base',
    fields: {
        name: createDefineField('key', 'String', describeKeyField),
        label: createDefineField('label', 'String', describeLabelField),
        tip: createDefineField('tip', 'String', describeTipField),
        type: createDefineField('type', ECtrlType.Base, desrcibeTypeField),
        isElevated: createDefineField('isElevated', 'Boolean', describeIsElevated),
        params: createDefineField('name', 'Object', ''),
    },
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

export const describeInput: IPropertyDefineData = {
    name: '文本框',
    type: ECtrlType.Input,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {
                default: createDefineField('default', 'String', desrcibeDefaultField),
                placeholder: createDefineField('placeholder', 'String', desrcibePlaceholderField),
                disabled: createDefineField('disabled', 'String', desrcibeDisabledField),
                maxlength: createDefineField('maxlength', 'String', desrcibeMaxlengthField),
            }
        }
    },
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


export const describeTextArea: IPropertyDefineData = {
    name: '文本域',
    type: ECtrlType.TextArea,
    fields: {
        ...describeInput.fields,
        params: {
            ...describeInput.fields.params,
            children: {
                ...describeInput.fields.params.children,
                resize: createDefineField('resize', 'String', '改变大小。none：不可改变大小；vertical：垂直方向可改变大小；'),
            }
        }
    }
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

export const describeInputNumber: IPropertyDefineData = {
    name: '数字输入框',
    type: ECtrlType.InputNumber,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {
                default: createDefineField('default', 'Number', desrcibeDefaultField),
                placeholder: createDefineField('placeholder', 'String', desrcibePlaceholderField),
                disabled: createDefineField('disabled', 'String', desrcibeDisabledField),
                min: createDefineField('min', 'Number', '最小值'),
                max: createDefineField('max', 'Number', '最大值'),
                precision: createDefineField('precision', 'Number', '精度'),
                controls: createDefineField('controls', 'Boolean', '是否显示加减控制按钮'),
            },
        }
    }
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
export const describeCheckbox: IPropertyDefineData = {
    name: '复选框',
    type: ECtrlType.Checkbox,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {
                default: createDefineField('default', 'Array', desrcibeDefaultField),
                disabled: createDefineField('disabled', 'String', desrcibeDisabledField),
                options: createDefineField('options', 'Array', '选项列表', true),
                layout: createDefineField('layout', "String", '布局方式。vertical：垂直；horizontal：水平。'),
            }
        }
    }
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
        mode?: TPropertyParam<'single' | 'gradient' | ('single' | 'gradient')[]>;
    }
}
export const describeColorPicker: IPropertyDefineData = {
    name: '颜色选择器',
    type: ECtrlType.ColorPicker,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 日期选择器输入控件定义
 */
export interface IPropertyDatePicker extends IPropertyBase {
    type: ECtrlType.DatePicker;
    params?: {
        default?: TPropertyParam<string>;
        disabled?: TPropertyParam<boolean>;
        allowClear?: TPropertyParam<boolean>;
        mode?: TPropertyParam<'time' | 'date' | 'month' | 'year'>;
        placeholder?: TPropertyParam<string>;
    }
}
export const describeDatePicker: IPropertyDefineData = {
    name: '日期选择器',
    type: ECtrlType.DatePicker,
    fields: {
        ...describeBase.fields,
    }
}

/**
 * 时间选择器输入控件定义
 */
export interface IPropertyTimePicker extends IPropertyBase {
    type: ECtrlType.TimePicker,
    params?: {
        default: TPropertyParam<string>;
    }
}
export const describeTimePicker: IPropertyDefineData = {
    name: '时间选择器',
    type: ECtrlType.TimePicker,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
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
export const describeRadio: IPropertyDefineData = {
    name: '单选框',
    type: ECtrlType.Radio,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {
                default: createDefineField('default', ['String', 'Number', 'Boolean'], desrcibeDefaultField),
                disabled: createDefineField('disabled', 'Boolean', desrcibeDisabledField),
                options: createDefineField('options', 'Array', '选项列表', true),
                isBlock: createDefineField('isBlock', 'Boolean', '是否撑满宽度'),
                optionType: createDefineField('optionType', 'String', '设置 options 类型，default：圆点；button：按钮'),
                buttonStyle: createDefineField('buttonStyle', 'String', '设置按钮类型，outline：描边；solid：实色填充'),
            },
        }
    }
}

/**
 * 滑动条输入控件定义
 */
export interface IPropertySlider extends IPropertyBase {
    type: ECtrlType.Slider,
    params?: {

    }
}
export const describeSlider: IPropertyDefineData = {
    name: '滑动条',
    type: ECtrlType.Slider,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 开关输入控件定义
 */
export interface IPropertySwitch extends IPropertyBase {
    type: ECtrlType.Switch,
    params?: {

    }
}
export const describeSwitch: IPropertyDefineData = {
    name: '开关',
    type: ECtrlType.Switch,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 下拉选择输入控件定义
 */
export interface IPropertySelect extends IPropertyBase {
    type: ECtrlType.Select,
    params?: {

    }
}
export const describeSelect: IPropertyDefineData = {
    name: '下拉选择',
    type: ECtrlType.Select,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 折叠控件定义
 */
export interface IPropertyCollapse extends IPropertyBase {
    type: ECtrlType.Collapse,
    children: TPropertyDefine[],
}
export const describeCollapse: IPropertyDefineData = {
    name: '折叠面板',
    type: ECtrlType.Collapse,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
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
export const describeCollapseSwitch: IPropertyDefineData = {
    name: '折叠面板开关',
    type: ECtrlType.CollapseSwitch,
    description: "为折叠面板添加一个开关",
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 分割线控件定义
 */
export interface IPropertyDivider extends IPropertyBase {
    type: ECtrlType.Divider,
    params?: {

    }
}
export const describeDivider: IPropertyDefineData = {
    name: '分割线',
    type: ECtrlType.Divider,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
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
export const describeFlex: IPropertyDefineData = {
    name: '弹性容器',
    type: ECtrlType.Flex,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
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
export const describeGrid: IPropertyDefineData = {
    name: '网格容器',
    type: ECtrlType.Grid,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
}

/**
 * 列表容器定义
 */
export interface IPropertyList extends IPropertyBase {
    type: ECtrlType.List,
    children: [TPropertyDefine],
    params?: {

    }
}
export const describeList: IPropertyDefineData = {
    name: '列表容器',
    type: ECtrlType.List,
    fields: {
        ...describeBase.fields,
        params: {
            ...describeBase.fields.params,
            children: {},
        }
    }
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
export type TPropertyDefine = IPropertyInput | IPropertyTextArea | IPropertyInputNumber | IPropertyColorPicker | IPropertyCheckbox | IPropertyDatePicker | IPropertyTimePicker | IPropertyRadio | IPropertySlider | IPropertySwitch | IPropertySelect | IPropertyCollapse | IPropertyCollapseSwitch | IPropertyDivider | IPropertyFlex | IPropertyGrid | IPropertyList;


export interface IRenderPropertyDefine {
    id: string;
    ctrl: TPropertyDefine,
    path: TPropertyDefine[],
    parents: TPropertyDefine[],
    children?: IRenderPropertyDefine[],
}
