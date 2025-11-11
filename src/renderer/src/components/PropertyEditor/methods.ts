import { createUUID, isEmpty, isNull } from "@renderer/utils/methods";
import { arrayContainerCtrls, ECtrlType, IRenderPropertyDefine, objectContainerCtrls, TPropertyDefine } from "./declare"
import tryDecodeFuncStr from "./tryDecodeFuncStr"
import tryRunPropertyGetter from "./tryRunPropertyGetter";

/**
 * 合并对象
 * @param base 
 * @param increments 
 * @param isMergeArray 
 * @returns 
 */
export const mergeWriteBackValues = (base: any, increments: any) => {
    if (isNull(base)) {// 源数据为空时
        return increments;
    }
    if (Array.isArray(base) && Array.isArray(increments)) {// 合并数组
        const temp = [...base];
        for (let i = 0, item; item = increments[i]; i++) {
            temp[i] = mergeWriteBackValues(temp[i], item);
        }
        return temp;
    }
    if (typeof base === 'object' && typeof increments === 'object') {// 合并对象
        const temp = { ...base };
        for (const key in increments) {
            temp[key] = mergeWriteBackValues(temp[key], increments[key]);
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
export const createWriteBackValues = (path: TPropertyDefine[], value: any, root: Record<string, any> = {}, getArrayCtrlIndex?: (path: TPropertyDefine[], ctrl: TPropertyDefine) => number) => {
    const toWriteBack = (parent: any, restPath: TPropertyDefine[], throughPath: TPropertyDefine[], value: any) => {
        const nexts = restPath.slice(1);
        const current = restPath[0];
        const next = nexts[0];
        if (!current) return parent;
        const { key, type } = current;
        const isArrayParent = Array.isArray(parent);// 上层结构是否为数组
        const wrap = arrayContainerCtrls.includes(type) ? [] : {};
        if (!isArrayParent && !next) {// 写入对象字段值
            return { ...parent, [key]: objectContainerCtrls.concat(arrayContainerCtrls).includes(type) && wrap || value };
        } else if (!isArrayParent && next) {// 写入对象字段结构
            return { ...parent, [key]: toWriteBack(wrap, nexts, [...throughPath, current], value) };
        } else if (isArrayParent && !next && typeof getArrayCtrlIndex == 'function') {// 写入数组值
            const currentIndex = getArrayCtrlIndex(throughPath, current);
            return parent.slice(0, currentIndex).concat(isEmpty(value) ? [] : [value]).concat(parent.slice(currentIndex + 1));
        } else if (isArrayParent && next && typeof getArrayCtrlIndex == 'function') {// 写入数组对象结构
            const currentIndex = getArrayCtrlIndex(throughPath, current);
            return parent.slice(0, currentIndex).concat([toWriteBack(wrap, nexts, [...throughPath, current], value)]).concat(parent.slice(currentIndex + 1));
        } else {
            return parent;
        }
    }
    return mergeWriteBackValues(root, toWriteBack(root, path, [], value));
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
export const analysePropertyDefine = (ctrls: TPropertyDefine[]) => {
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
        defaults = mergeWriteBackValues(defaults, createWriteBackValues(path, ctrlDefaultValue, defaults, () => 0));
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
            return { ...item, params: item.params ? params : undefined, children: toDropFunc(item['children']) }
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
                return { ...item, params: item.params ? params : undefined, children: toRestoreFunc(item['children']) }
            })
        }
        return toRestoreFunc(ctrls);
    } catch (err) {
        console.error(err);
        return [];
    }
}

export const createMockPropertyDefine = (): TPropertyDefine[] => {
    return [
        {
            key: 'obj',
            label: 'obj',
            type: ECtrlType.Collapse,
            children: [
                {
                    key: 'obj.input',
                    label: 'obj.input',
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'List Object Property'
                    }
                },
                {
                    key: 'obj.input2',
                    label: 'obj.input2',
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'List Object Property'
                    }
                },
                {
                    key: 'obj.input3',
                    label: 'obj.input3',
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'List Object Property'
                    }
                },
                {
                    key: 'obj.textare',
                    label: 'obj.textare',
                    type: ECtrlType.TextArea,
                    params: {
                        default: () => 'List Object Property'
                    }
                },
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
                    ]
                },
            ]
        },
    ]
    return [
        {
            key: createUUID(),
            label: 'Collapse',
            type: ECtrlType.Collapse,
            children: [
                {
                    key: createUUID(),
                    label: 'Input',
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'level-2-input'
                    }
                },
                {
                    key: createUUID(),
                    label: 'Input',
                    type: ECtrlType.Input,
                    isElevated: true,
                    params: {
                        default: () => 'level-1-input'
                    }
                },
                {
                    key: createUUID(),
                    label: 'Collapse',
                    type: ECtrlType.Collapse,
                    isElevated: true,
                    children: [
                        {
                            key: createUUID(),
                            label: 'Input',
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'level-2-input'
                            }
                        },
                        {
                            key: createUUID(),
                            label: 'Input',
                            type: ECtrlType.Input,
                            isElevated: true,
                            params: {
                                default: () => 'level-2-input'
                            }
                        },
                    ]
                },
                {
                    key: createUUID(),
                    label: 'Collapse',
                    type: ECtrlType.Collapse,
                    children: [
                        {
                            key: createUUID(),
                            label: 'Input',
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'level-3-input'
                            }
                        },
                        {
                            key: createUUID(),
                            label: 'Input',
                            type: ECtrlType.Input,
                            isElevated: false,
                            params: {
                                default: () => 'level-3-input'
                            }
                        },
                        {
                            key: createUUID(),
                            label: 'Collapse',
                            type: ECtrlType.Collapse,
                            children: [
                                {
                                    key: createUUID(),
                                    label: 'Input',
                                    type: ECtrlType.Input,
                                    params: {
                                        default: () => 'level-4-input'
                                    }
                                },
                                {
                                    key: createUUID(),
                                    label: 'Input',
                                    type: ECtrlType.Input,
                                    isElevated: true,
                                    params: {
                                        default: () => 'level-1-input'
                                    }
                                },
                            ]
                        },
                        {
                            key: createUUID(),
                            label: 'Collapse',
                            type: ECtrlType.Collapse,
                            isElevated: true,
                            children: [
                                {
                                    key: createUUID(),
                                    label: 'Input',
                                    type: ECtrlType.Input,
                                    params: {
                                        default: () => 'level-2-input'
                                    }
                                },
                                {
                                    key: createUUID(),
                                    label: 'Input',
                                    type: ECtrlType.Input,
                                    isElevated: false,
                                    params: {
                                        default: () => 'level-2-input'
                                    }
                                },
                            ]
                        },
                    ]
                },
            ]
        },
    ]
    return [
        // {
        //     name: 'Input',
        //     label: 'Input',
        //     type: ECtrlType.Input,
        //     params: {
        //         default: (ctrl, values, injects) => {
        //             return 'Input'
        //         }
        //     }
        // },
        // {
        //     name: 'TextArea',
        //     label: 'TextArea',
        //     type: ECtrlType.TextArea,
        //     params: {
        //         default: 'TextArea'
        //     }
        // },
        {
            key: 'Collapse',
            label: 'Collapse',
            type: ECtrlType.Collapse,
            children: [
                {
                    key: 'Input_global',
                    label: 'Input',
                    isElevated: true,
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'input_global'
                    }
                },
                {
                    key: 'Input_scope',
                    label: 'Input',
                    isElevated: false,
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'Input_scope'
                    }
                },
                {
                    key: 'Collapse_scope',
                    label: 'Collapse',
                    type: ECtrlType.Collapse,
                    children: [
                        {
                            key: 'Input_global',
                            label: 'Input',
                            isElevated: true,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'input_global'
                            }
                        },
                        {
                            key: 'Input_scope',
                            label: 'Input',
                            isElevated: false,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'Input_scope'
                            }
                        },
                        {
                            key: 'Collapse_elevated',
                            label: 'Collapse',
                            type: ECtrlType.Collapse,
                            isElevated: true,
                            children: [
                                {
                                    key: 'Input_elevated',
                                    label: 'Input',
                                    isElevated: true,
                                    type: ECtrlType.Input,
                                    params: {
                                        default: () => 'Input_elevated'
                                    }
                                },
                                {
                                    key: 'Input_scope',
                                    label: 'Input',
                                    isElevated: false,
                                    type: ECtrlType.Input,
                                    params: {
                                        default: () => 'Input_scope'
                                    }
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'Collapse_elevated',
                    label: 'Collapse',
                    type: ECtrlType.Collapse,
                    isElevated: true,
                    children: [
                        {
                            key: 'Input_elevated',
                            label: 'Input',
                            isElevated: true,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'Input_elevated'
                            }
                        },
                        {
                            key: 'Input_scope',
                            label: 'Input',
                            isElevated: false,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'Input_scope'
                            }
                        },
                    ],
                },
                // {
                //     name: 'List',
                //     label: 'List',
                //     type: ECtrlType.List,
                //     children: [
                //         {
                //             name: 'Collapse_elevated',
                //             label: 'Collapse',
                //             type: ECtrlType.Collapse,
                //             isElevated: false,
                //             children: [
                //                 {
                //                     name: 'Collapse_scoped',
                //                     label: 'Collapse',
                //                     type: ECtrlType.Collapse,
                //                     isElevated: true,
                //                     children: [
                //                         {
                //                             name: 'Input_elevated',
                //                             label: 'Input',
                //                             isElevated: true,
                //                             type: ECtrlType.Input,
                //                             params: {
                //                                 default: () => 'Input_elevated'
                //                             }
                //                         },
                //                         {
                //                             name: 'Input_scope',
                //                             label: 'Input',
                //                             isElevated: false,
                //                             type: ECtrlType.Input,
                //                             params: {
                //                                 default: () => 'Input_scope'
                //                             }
                //                         },
                //                     ],
                //                 },
                //                 {
                //                     name: 'Input_elevated',
                //                     label: 'Input',
                //                     isElevated: true,
                //                     type: ECtrlType.Input,
                //                     params: {
                //                         default: () => 'Input_elevated'
                //                     }
                //                 },
                //                 {
                //                     name: 'Input_scope',
                //                     label: 'Input',
                //                     isElevated: false,
                //                     type: ECtrlType.Input,
                //                     params: {
                //                         default: () => 'Input_scope'
                //                     }
                //                 },
                //             ],
                //         },
                //     ],
                // },
            ],
        },
    ]
}
