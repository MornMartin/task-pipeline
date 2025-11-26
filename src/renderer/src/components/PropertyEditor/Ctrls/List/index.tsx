import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IPropertyList, IRenderPropertyDefine, TPropertyDefine } from '../../declare';
import style from './index.module.less'
import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toRender } from '../renderer';
import { analysePropertyDefine, createWriteBackObjectValues } from '../../methods';
import Label from '../Label/index';
import { copy, createUUID, debounce, isNull } from '@renderer/utils/methods';
import { PropertyGetterContext } from '../..';
import { EUpdateValue, getArrayDiffs, IDiff } from '@renderer/utils/getArrayDiffs';
import { compare } from '@renderer/utils/compare';

const emitChangeDebounce = debounce();

interface IProps {
    define: IPropertyList;
    value: any[];
    onChange: (e: any[]) => void;
}

interface IValueMap {
    [id: string]: {
        index: number;
        value: any
    }
}

const localValueMapReducer = (state: IValueMap, action: { type: EUpdateValue | 'patch', diffs?: IDiff[], id?: string, payload?: any, getIndexHandler?: () => number }) => {
    const { type, id, payload, diffs, getIndexHandler } = action;
    switch (type) {
        case EUpdateValue.add: {
            if (typeof getIndexHandler !== 'function') throw Error('添加失败，数据index无效');
            return { ...state, [createUUID()]: { index: getIndexHandler(), value: payload } } as IValueMap;
        };
        case EUpdateValue.delete: {
            if (!id) throw Error('删除失败，数据ID无效');
            const temp = { ...state };
            delete temp[id];
            return temp;
        };
        case EUpdateValue.modify: {
            if (!id) throw Error('修改失败，数据ID无效');
            return { ...state, [id]: { index: state[id]['index'], value: payload } } as IValueMap;
        };
        case 'patch': {
            if (!Array.isArray(diffs)) throw Error('批量更新失败，Diffs无效');
            const tempState = copy(state);
            const stateList = Object.keys(state)
                .map(id => {
                    return { ...state[id], id }
                })
                .sort((a, b) => a.index - b.index);
            diffs.forEach(item => {
                const { type, index, value } = item;
                // diff 里的索引是相对数组结构的索引，非数据绑定索引
                const id = type === EUpdateValue.add ? createUUID() : stateList[index].id;
                if (type === EUpdateValue.modify) {
                    tempState[id] = { ...tempState[id], value };
                } else if (type === EUpdateValue.delete) {
                    delete tempState[id]
                } else if (type === EUpdateValue.add) {
                    if (typeof getIndexHandler !== 'function') throw Error('添加失败，数据index无效');
                    tempState[id] = { index: getIndexHandler(), value }
                }
            })
            return { ...tempState }
        }
        default: {
            return state;
        }
    }
}

const encodeValueMap = (values: any[], getIndex: () => number): IValueMap => {
    const temp: IValueMap = {};
    for (const item of (values || [])) {
        temp[createUUID()] = { index: getIndex(), value: item };
    }
    return temp;
}

const decodeValueMap = (valueMap: IValueMap): any[] => {
    const temp: { index: number, value: any }[] = [];
    for (const id in valueMap) {
        temp.push(valueMap[id]);
    }
    return temp.sort((a, b) => a.index - b.index).map(item => item.value);
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const valueIndex = useRef<number>(0);
    const propertyGetter = useContext(PropertyGetterContext);
    const [disableAddItem, setDisableAddItem] = useState(false);
    const [disableDelItem, setDisableDelItem] = useState(false);
    const { template } = define;
    const { decoratedCtrls, defaults } = analysePropertyDefine(template.map(item => {
        return { ...item, isElevated: true }// 若子项为对象时，提升当前子项为Root变量，阻止后续控件变量提升到Root
    }));
    const [decoratedCtrl] = decoratedCtrls;// List template有且仅有一项
    const [localValueMap, dispatchLocalValueMap] = useReducer(localValueMapReducer, encodeValueMap(value, () => valueIndex.current++));
    const localeValueMapTemp = useRef<IValueMap>(localValueMap);
    /**
     * 删除项
     * @param id 
     */
    const toDelete = (id: string) => {
        dispatchLocalValueMap({ type: EUpdateValue.delete, id })
    }

    /**
     * 新增项
     */
    const toAdd = () => {
        dispatchLocalValueMap({ type: EUpdateValue.add, getIndexHandler: () => valueIndex.current++, payload: copy(defaults[decoratedCtrl.ctrl.key]) })
    }

    /**
     * 修改项
     * @param id 
     * @param bindValue 子项绑定值
     */
    const toModify = (id: string, bindValue: any) => {
        const payload = bindValue[decoratedCtrl.ctrl.key];
        if (compare(payload, localValueMap[id].value)) return;
        dispatchLocalValueMap({ type: EUpdateValue.modify, id, payload });
    }

    /**
     * 获取子项绑定值
     * @param id 
     * @param valueMap 
     * @returns 
     */
    const getRenderBindValue = (id: string, valueMap: IValueMap) => {
        return { [decoratedCtrl.ctrl.key]: valueMap[id]?.value }
    }

    useEffect(() => {
        const localeValue = decodeValueMap(localValueMap);
        localeValueMapTemp.current = { ...localValueMap };
        emitChangeDebounce(() => {
            if (compare(localeValue, value)) return;
            onChange([...localeValue]);
        });
    }, [localValueMap]);

    useEffect(() => {
        const currentValue = decodeValueMap(localeValueMapTemp.current);
        if (JSON.stringify(currentValue) === JSON.stringify(value)) return;
        const diffs = getArrayDiffs(currentValue, value);
        if (!diffs.length) return;
        dispatchLocalValueMap({ type: 'patch', diffs, getIndexHandler: () => valueIndex.current++, });
    }, [value])


    useEffect(() => {
        setDisableAddItem(propertyGetter(define.params?.disableAddItem, define) ?? undefined);
        setDisableDelItem(propertyGetter(define.params?.disableDelItem, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.List} style={{ ['--listOperationBarWidth']: disableDelItem ? '0px' : '32px' } as any}>
            <div className={style.listLabel}>
                {define?.label ? <Label label={define?.label}></Label> : null}
            </div>
            {
                Object.keys(localValueMap).map((id) => {
                    return (
                        <div className={style.listItem} key={id}>
                            <div className={style.listCtrlWrap}>
                                {
                                    toRender(decoratedCtrl, getRenderBindValue(id, localValueMap), (e, path) => toModify(id, createWriteBackObjectValues(path, e, getRenderBindValue(id, localValueMap))), true)
                                }
                            </div>
                            {
                                disableDelItem ? null : (
                                    <div className={style.listOperations}>
                                        <DeleteOutlined style={{ cursor: 'pointer' }} onClick={() => toDelete(id)} />
                                    </div>
                                )
                            }
                        </div>
                    )
                })
            }
            {
                disableAddItem ? null : (
                    <div className={style.listAdd} onClick={() => toAdd()} >
                        <PlusOutlined />
                    </div>
                )
            }
        </div>
    )
}

export default Component;
