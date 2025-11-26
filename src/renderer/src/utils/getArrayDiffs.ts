import { compare } from "./compare"

export const enum EUpdateValue {
    add = 'add',
    delete = 'delete',
    modify = 'modify',
}

export interface IDiff {
    value: any, index: number, type: EUpdateValue
}

const createDiff = (type: EUpdateValue, index: number, value: any): IDiff => {
    return { type, index, value };
}

/**
 * 对比数组收尾两端获取目标数组的增量修改量，原数组的删除量
 * @param source 原数组
 * @param target 目标数组
 * @returns 
 */
export const getArrayDiffs = (source: any[], target: any[]): IDiff[] => {
    if (!source?.length && !target?.length) {// 列表都为空，不变
        return []
    }
    if (!source?.length && target?.length) {// 列表完全新增
        return target.map((value, index) => {
            return createDiff(EUpdateValue.add, index, value);
        })
    }
    if (source?.length && !target?.length) {// 列表完全清除
        return source.map((value, index) => {
            return createDiff(EUpdateValue.delete, index, value);
        })
    }
    const temp: IDiff[] = [];
    const sourceMap: Record<number | string, any> = {};
    const targetMap: Record<number | string, any> = {};
    source.forEach((item, index) => {
        sourceMap[index] = item;
    })
    for (let index = 0; index < target.length; index++) {
        const targetItem = target[index];
        targetMap[index] = targetItem;
        if (compare(targetItem, sourceMap[index])) {// 从数组头开始对比，序号和值相等既忽略
            delete targetMap[index];
            delete sourceMap[index];
        }
    }
    for (let i = target.length - 1, j = source.length - 1; i >= 0; i--, j--) {
        const targetItem = target[i];
        if (compare(targetItem, sourceMap[j])) {// 从数组末开始对比，队尾相对序号相等和值相等既忽略
            delete targetMap[i];
            delete sourceMap[j]
        } else {// 若不同则跳出
            break;
        }
    }
    for (const index of Object.keys(targetMap)) {
        const isSourceExisted = Object.hasOwn(sourceMap, index);
        if (isSourceExisted) {// 若序号存在，记录修改
            temp.push(createDiff(EUpdateValue.modify, Number(index), targetMap[index]));
            delete sourceMap[index];
        } else {// 若序号不存在，记录新增
            temp.push(createDiff(EUpdateValue.add, Number(index), targetMap[index]));
        }
    }
    for (const index of Object.keys(sourceMap)) {// 原数组剩余项记录为删除
        temp.push(createDiff(EUpdateValue.delete, Number(index), null));
    }
    return temp.sort((a, b) => a.index - b.index);
}
