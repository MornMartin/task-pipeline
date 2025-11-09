import { createUUID } from "@renderer/utils/methods";
import { arrayContainerCtrls, ECtrlType, objectContainerCtrls, TPropertyDefine } from "./declare"
import tryDecodeFuncStr from "./tryDecodeFuncStr"

export const mergeObjects = (base: Record<string, any>, increments: Record<string, any>, isMergeArray: boolean = false) => {
    const temp = { ...base };
    for (const key in increments) {
        const currentValue = increments[key];
        const baseValue = base[key];
        if (typeof currentValue === 'object' && !Array.isArray(currentValue)) {
            temp[key] = mergeObjects(baseValue || {}, currentValue);
        } else if (typeof currentValue === 'object' && Array.isArray(currentValue) && isMergeArray) {
            temp[key] = [...(Array.isArray(baseValue) ? baseValue : []), ...currentValue];
        } else if (typeof currentValue !== 'undefined') {// undefined 不作为有效值复写
            temp[key] = currentValue;
        }
    }
    return temp;
}

export const createWriteBackValues = (paths: TPropertyDefine[], value: any, root: Record<string, any> = {}) => {
    const toWriteBack = (parent: any, paths: TPropertyDefine[], value: any) => {
        const current = paths[0];
        const nexts = paths.slice(1);
        if (!current) return parent;
        const { name } = current;
        if (!nexts.length) {
            return { ...parent, [name]: value };
        }
        return { ...parent, [name]: toWriteBack(arrayContainerCtrls.includes(current.type) ? [] : {}, nexts, value) };

    }
    return mergeObjects(root, toWriteBack({}, paths, value));
}

export const getWriteBackPaths = (paths: TPropertyDefine[]): TPropertyDefine[] => {
    for (let index = 0, item; item = paths[index]; index++) {
        const { isElevated, type } = item;
        if (isElevated || arrayContainerCtrls.includes(type)) {
            return [item].concat(paths.slice(index + 1));
        }
    }
    return paths;
}

export const analysePropertyDefine = (ctrls: TPropertyDefine[]) => {
    const toDecorate = (ctrls: TPropertyDefine[], parents: TPropertyDefine[] = [], onDecorate = (decorated: { id: string, ctrl: TPropertyDefine, parents: TPropertyDefine[], paths: TPropertyDefine[] }) => void 0) => {
        if (!Array.isArray(ctrls)) return;
        return ctrls.map(item => {
            const id = createUUID();
            const paths = getWriteBackPaths(parents.concat([item]));
            const decorated = { id, ctrl: item, parents, paths, children: toDecorate(item['children'], paths, onDecorate) };
            onDecorate(decorated);
            return decorated;
        })
    }
    let defaults: Record<string, any> = {};
    const ctrlMap: Record<string, { ctrl: TPropertyDefine, parents: TPropertyDefine[], paths: TPropertyDefine[] }> = {};
    const decoratedCtrls = toDecorate(ctrls, [], ({ id, ctrl, parents, paths }) => {
        ctrlMap[id] = { ctrl, paths, parents };
        defaults = createWriteBackValues(paths, ctrl.params?.['default'], defaults);
    });
    console.log(ctrls, defaults);
    return { ctrlMap, decoratedCtrls, defaults };
}

export const createDefaultValues = (ctrls: TPropertyDefine[]): Record<string, any> => {
    return {}
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
            name: 'Input',
            label: 'Input',
            type: ECtrlType.Input,
            params: {
                default: () => 'Input'
            }
        },
        {
            name: 'TextArea',
            label: 'TextArea',
            type: ECtrlType.TextArea,
            params: {
                default: 'TextArea'
            }
        },
        {
            name: 'Collapse',
            label: 'Collapse',
            type: ECtrlType.Collapse,
            children: [
                {
                    name: 'Input_global',
                    label: 'Input',
                    isElevated: true,
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'input_global'
                    }
                },
                {
                    name: 'Input_scope',
                    label: 'Input',
                    isElevated: false,
                    type: ECtrlType.Input,
                    params: {
                        default: () => 'Input_scope'
                    }
                },
                {
                    name: 'Collapse_elevated',
                    label: 'Collapse',
                    type: ECtrlType.Collapse,
                    isElevated: true,
                    children: [
                        {
                            name: 'Input_elevated',
                            label: 'Input',
                            isElevated: true,
                            type: ECtrlType.Input,
                            params: {
                                default: () => 'Input_elevated'
                            }
                        },
                        {
                            name: 'Input_scope',
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
    ]
}
