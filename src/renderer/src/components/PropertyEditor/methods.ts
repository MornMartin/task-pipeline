import { createUUID, isEmpty, isNull } from "@renderer/utils/methods";
import { arrayContainerCtrls, ECtrlType, IPropertyDefineData, IRenderPropertyDefine, objectContainerCtrls, TPropertyDefine } from "./declare"
import tryDecodeFuncStr from "./tryDecodeFuncStr"
import tryRunPropertyGetter from "./tryRunPropertyGetter";
import { createPropertyTable, createSection } from "./doc";

/**
 * 合并对象
 * @param base 
 * @param increments 
 * @param isMergeArray 
 * @returns 
 */
export const mergeWriteBackValues = (base: any, increments: any, isMergeArray = true) => {
    if (isNull(base)) {// 源数据为空时
        return increments;
    }
    if (Array.isArray(base) && Array.isArray(increments) && isMergeArray) {// 合并数组
        const temp = [...base];
        for (let i = 0, item; item = increments[i]; i++) {
            temp[i] = mergeWriteBackValues(temp[i], item, isMergeArray);
        }
        return temp;
    }
    if (Array.isArray(base) && Array.isArray(increments) && !isMergeArray) {// 不合并数组
        return increments;
    }
    if (typeof base === 'object' && typeof increments === 'object') {// 合并对象
        const temp = { ...base };
        for (const key in increments) {
            temp[key] = mergeWriteBackValues(temp[key], increments[key], isMergeArray);
        }
        return temp;
    }
    // 基础数据不为对象/数组时
    // 赋予数据不为对象/数组时
    return increments;
}

/**
 * 创建回写属性值
 * @param path 
 * @param value 
 * @param root 
 * @returns 
 */
export const createWriteBackObjectValues = (path: TPropertyDefine[], value: any, root: Record<string, any> = {}) => {
    const toWriteBack = (parent: any, restPath: TPropertyDefine[], throughPath: TPropertyDefine[], value: any) => {
        const nexts = restPath.slice(1);
        const current = restPath[0];
        const next = nexts[0];
        if (!current) return parent;
        const { key } = current;
        if (!next) {
            return { ...parent, [key]: value };
        }
        return { ...parent, [key]: toWriteBack({}, nexts, [...throughPath, current], value) };
    }
    return mergeWriteBackValues(root, toWriteBack(root, path, [], value), false);
}

/**
 * 获取控件绑定值
 * @param path 
 * @param values 
 * @returns 
 */
export const getPropertyValue = (path: TPropertyDefine[], values: Record<string, any>): any => {
    let temp = values;
    for (const item of path) {
        temp = temp?.[item.key];
        if (isNull(temp)) return temp;
    }
    return temp;
}

/**
 * 获取回写路径
 * @param path 
 * @returns 
 */
export const getWriteBackPath = (path: TPropertyDefine[]): TPropertyDefine[] => {
    const interpolatedFrames: TPropertyDefine[] = [];
    const keyFrames: TPropertyDefine[] = [];
    for (let index = 0, item; item = path[index]; index++) {
        const { isElevated, type } = item;
        if (isElevated) {// 当控件绑定字段需要提升时，纳入关键帧，去除此前的路径缓存
            interpolatedFrames.length = 0;
            keyFrames.push(item);
        } else if (arrayContainerCtrls.includes(type)) {// 当控件绑定字段为数组时，作为关键帧处理，但保留缓存路径
            keyFrames.push(...interpolatedFrames, item);
            interpolatedFrames.length = 0;
        } else if (arrayContainerCtrls.includes(keyFrames[keyFrames.length - 1]?.type)) {// 当控件上层字段为数组时，添加当前作为关键帧
            keyFrames.push(item);
            interpolatedFrames.length = 0;
        } else {
            interpolatedFrames.push(item);
        }
    }
    return keyFrames.concat(interpolatedFrames);
}

/**
 * 分析属性定义
 * @param ctrls 
 * @returns 
 */
export const analysePropertyDefine = (ctrls?: TPropertyDefine[]) => {
    if (!ctrls?.length) return { decoratedCtrls: [], defaults: {} };
    const toDecorate = (ctrls: TPropertyDefine[], parents: TPropertyDefine[] = [], onDecorate = (decorated: { id: string, ctrl: TPropertyDefine, parents: TPropertyDefine[], path: TPropertyDefine[] }) => void 0) => {
        if (!Array.isArray(ctrls)) return;
        return ctrls.map(item => {
            const id = createUUID();
            const path = getWriteBackPath(parents.concat([item]));
            const decorated = { id, ctrl: item, parents, path };
            typeof onDecorate === 'function' && onDecorate(decorated);
            return { ...decorated, children: toDecorate(item['children'], parents.concat(item), onDecorate) } as IRenderPropertyDefine;
        })
    }
    let defaults: Record<string, any> = {};
    const decoratedCtrls: IRenderPropertyDefine[] = toDecorate(ctrls, [], ({ id, ctrl, parents, path }) => {
        const ctrlDefaultValue = tryRunPropertyGetter(ctrl.params?.['default'], ctrl);
        defaults = mergeWriteBackValues(defaults, createWriteBackObjectValues(path, ctrlDefaultValue, defaults));
    });
    return { decoratedCtrls, defaults };
}

/**
 * 编码属性定义json
 * @param ctrls 
 * @returns 
 */
export const encodePropertyDefineJson = (ctrls: TPropertyDefine[]): string => {
    const toDropFunc = (ctrls: TPropertyDefine[]) => {
        if (!Array.isArray(ctrls)) return;
        return ctrls.map(item => {
            const params = {};
            for (const key in (item.params || {})) {
                const param = item.params?.[key];
                params[key] = typeof param === 'function' ? param.toString() : param;
            }
            return { ...item, params: item.params ? params : undefined, children: toDropFunc(item['children']), template: toDropFunc(item['template']) }
        })
    }
    return JSON.stringify(toDropFunc(ctrls), null, 4);
}

/**
 * 解码属性定义json
 * @param defines 
 * @returns 
 */
export const decodePropertyDefineJson = (defines: string): TPropertyDefine[] => {
    try {
        const ctrls = JSON.parse(defines);
        const toRestoreFunc = (ctrls: TPropertyDefine[]) => {
            if (!Array.isArray(ctrls)) return;
            return ctrls.map(item => {
                const params = {};
                for (const key in (item.params || {})) {
                    const param = item.params?.[key];
                    params[key] = tryDecodeFuncStr(param);
                }
                return { ...item, params: item.params ? params : undefined, children: toRestoreFunc(item['children']), template: toRestoreFunc(item['template']) }
            })
        }
        return toRestoreFunc(ctrls);
    } catch (err) {
        console.error(err);
        return [];
    }
}

export const createPropertyCtrlDoc = (defineDatas: IPropertyDefineData[]) => {
    const sections = defineDatas.map(item => {
        const { ctrl, example, describe } = item;
        return `${createSection(ctrl.name, ctrl.describe, 2)}\n${createSection('样例', `\`\`\`json\n${JSON.stringify(example, null, 4)}\n\`\`\``, 3)}\n${createPropertyTable(example, describe)}`;
    }).join('\n');
    return `# 属性控件\n${sections}\n`;
}

export const createMockPropertyDefine = (): TPropertyDefine[] => {
    return [
        {
            key: 'obj',
            label: 'obj',
            type: ECtrlType.Collapse,
            children: [
                {
                    key: '_isActive',
                    type: ECtrlType.CollapseSwitch,
                    params: {
                        default: true
                    }
                },
                {
                    key: 'obj.list',
                    label: 'obj.list',
                    type: ECtrlType.List,
                    params: {
                        default: ['1', '2', '3']
                    },
                    template: [
                        {
                            key: 'hello',
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'List Object Property'
                            }
                        },
                    ]
                },
                // {
                //     key: 'obj.input2',
                //     label: 'obj.input2',
                //     type: ECtrlType.Input,
                //     params: {
                //         default: () => 'List Object Property'
                //     }
                // },
                // {
                //     key: 'obj.textare',
                //     label: 'obj.textare',
                //     type: ECtrlType.TextArea,
                //     params: {
                //         default: () => 'List Object Property'
                //     }
                // },
                {
                    key: 'obj.obj',
                    label: 'obj.obj',
                    type: ECtrlType.Collapse,
                    children: [
                        {
                            key: 'obj.obj.input',
                            label: 'obj.obj.input',
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'List Object Property'
                            }
                        },
                        {
                            key: 'input3',
                            label: 'input3',
                            isElevated: true,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'List Object Property'
                            }
                        },
                    ]
                },
            ]
        },
    ]
}
