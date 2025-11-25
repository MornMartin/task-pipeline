import { IRenderPropertyDefine, TPropertyDefine } from './declare'
import style from './index.module.less'
import { createContext, useEffect, useRef, useState } from 'react'
import { analysePropertyDefine, createWriteBackObjectValues, decodePropertyDefineJson } from './methods';
import { toRender } from './Ctrls/renderer';
import tryRunPropertyGetter from './tryRunPropertyGetter';
import { copy } from '@renderer/utils/methods';

const createPopertyGetterHandler = (values?: Record<string, any>, injects?: Record<string, any>) => {
    return (getter: any, ctrl: TPropertyDefine) => {
        return tryRunPropertyGetter(getter, ctrl, values, injects)
    }
}

export const PropertyGetterContext = createContext(createPopertyGetterHandler());

interface IProps {
    defines: string;
    values: Record<string, any>;
    injects?: Record<string, any>;
    onChange: (values: Record<string, any>, source: { ctrl: TPropertyDefine, path: TPropertyDefine[], value: any }) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { defines, values, injects } = props;
    const definesTemp = useRef<string>('');
    const valuesTemp = useRef<Record<string, any>>(values);
    const [ctrlList, setCtrlList] = useState<IRenderPropertyDefine[]>([]);

    const onChange = (e: any, path: TPropertyDefine[]) => {
        const values = createWriteBackObjectValues(path, e, valuesTemp.current);
        console.log(e, JSON.stringify(values));
        props.onChange(copy(values), { path, value: e, ctrl: path[path.length - 1] });
    }

    useEffect(() => {
        if (definesTemp.current === defines) return;
        const { decoratedCtrls } = analysePropertyDefine(decodePropertyDefineJson(defines));
        setCtrlList(decoratedCtrls);
        definesTemp.current = defines;
    }, [defines]);

    useEffect(() => {
        valuesTemp.current = values;
    }, [values])

    return <>
        <div className={style.PropertyEditor}>
            <PropertyGetterContext value={createPopertyGetterHandler(values, injects)}>
                {
                    ctrlList.map(item => toRender(item, values, onChange))
                }
            </PropertyGetterContext>
        </div>
    </>
}

export default Component;
