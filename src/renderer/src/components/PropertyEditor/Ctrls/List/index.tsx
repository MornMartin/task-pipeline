import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IPropertyList, IRenderPropertyDefine, TPropertyDefine } from '../../declare';
import style from './index.module.less'
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { toRender } from '../renderer';
import { analysePropertyDefine } from '../../methods';
import Label from '../Label/index';
import { copy, createUUID } from '@renderer/utils/methods';

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

const changeValueReducer = (state: Record<string, any>, action: { type: EUpdateValue, id?: string, payload?: any }) => {
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
    const { template } = define;
    const { decoratedCtrls, defaults } = analysePropertyDefine(template);
    const [decoratedCtrl] = decoratedCtrls;// List template有且仅有一项
    const [localeValueMap, dispatchLocaleValueMap] = useReducer(changeValueReducer, encodeValueMap(value));

    const toDelete = (id: string) => {
        dispatchLocaleValueMap({ type: EUpdateValue.delete, id })
    }

    const toAdd = () => {
        dispatchLocaleValueMap({ type: EUpdateValue.add, payload: copy(defaults[decoratedCtrl.ctrl.key]) })
    }

    const toModify = (id: string, payload: any) => {
        //@todo 模板为对象的处理方案
        dispatchLocaleValueMap({ type: EUpdateValue.modify, id, payload })
    }

    useEffect(() => {
        const value = decodeValueMap(localeValueMap);
        onChange([...value]);
    }, [localeValueMap]);

    useEffect(() => {
        const currentValue = decodeValueMap(localeValueMap);
        if (JSON.stringify(currentValue) === JSON.stringify(value)) return;
        //@todo 实现差异对比
    }, [value])


    return (
        <div className={style.List}>
            <div className={style.listLabel}>
                {define?.label ? <Label label={define?.label}></Label> : null}
            </div>
            {
                Object.keys(localeValueMap).map((id) => {
                    return (
                        <div className={style.listItem} key={id}>
                            <div className={style.listCtrlWrap}>
                                {
                                    toRender(decoratedCtrl, { [decoratedCtrl.ctrl.key]: localeValueMap[id] }, (e, path) => toModify(id, e), true)
                                }
                            </div>
                            <div className={style.listOperations}>
                                <DeleteOutlined style={{ cursor: 'pointer' }} onClick={() => toDelete(id)} />
                            </div>
                        </div>
                    )
                })
            }
            <div className={style.listAdd} onClick={() => toAdd()} >
                <PlusOutlined />
            </div>
        </div>
    )
}

export default Component;
