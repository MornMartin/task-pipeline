import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IPropertyList, IRenderPropertyDefine, TPropertyDefine } from '../../declare';
import style from './index.module.less'
import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toRender } from '../renderer';
import { analysePropertyDefine, createWriteBackObjectValues } from '../../methods';
import Label from '../Label/index';
import { copy, createUUID } from '@renderer/utils/methods';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyList;
    value: any[];
    onChange: (e: any[]) => void;
}

const enum EUpdateValue {
    add,
    delete,
    modify,
}

const localValueMapReducer = (state: Record<string, any>, action: { type: EUpdateValue, id?: string, payload?: any }) => {
    const { type, id, payload } = action;
    switch (type) {
        case EUpdateValue.add: {
            return { ...state, [createUUID()]: payload };
        };
        case EUpdateValue.delete: {
            if (!id) throw Error('删除失败，数据ID无效');
            const temp = { ...state };
            delete temp[id];
            return temp;
        };
        case EUpdateValue.modify: {
            if (!id) throw Error('修改失败，数据ID无效');
            return { ...state, [id]: payload }
        };
        default: {
            return state;
        }
    }
}

const encodeValueMap = (values: any[]): Record<string, any> => {
    const temp = {};
    for (const item of values) {
        temp[createUUID()] = item;
    }
    return temp;
}

const decodeValueMap = (map: Record<string, any>): any[] => {
    const temp: any[] = [];
    for (const key in map) {
        temp.push(map[key]);
    }
    return temp;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);
    const [disableAddItem, setDisableAddItem] = useState(false);
    const [disableDelItem, setDisableDelItem] = useState(false);
    const { template } = define;
    const { decoratedCtrls, defaults } = analysePropertyDefine(template.map(item => {
        return { ...item, isElevated: true }// 若子项为对象时，提升当前子项为Root变量，阻止后续控件变量提升到Root
    }));
    const [decoratedCtrl] = decoratedCtrls;// List template有且仅有一项
    const [localValueMap, dispatchLocalValueMap] = useReducer(localValueMapReducer, encodeValueMap(value));

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
        dispatchLocalValueMap({ type: EUpdateValue.add, payload: copy(defaults[decoratedCtrl.ctrl.key]) })
    }

    /**
     * 修改项
     * @param id 
     * @param bindValue 子项绑定值
     */
    const toModify = (id: string, bindValue: any) => {
        const payload = bindValue[decoratedCtrl.ctrl.key];
        dispatchLocalValueMap({ type: EUpdateValue.modify, id, payload })
    }

    /**
     * 获取子项绑定值
     * @param id 
     * @param valueMap 
     * @returns 
     */
    const getRenderBindValue = (id: string, valueMap: Record<string, any>) => {
        return { [decoratedCtrl.ctrl.key]: valueMap[id] }
    }

    useEffect(() => {
        const value = decodeValueMap(localValueMap);
        onChange([...value]);
    }, [localValueMap]);

    useEffect(() => {
        const currentValue = decodeValueMap(localValueMap);
        if (JSON.stringify(currentValue) === JSON.stringify(value)) return;
        //@todo 实现差异对比
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
