import { IRenderPropertyDefine, TPropertyDefine } from './declare'
import style from './index.module.less'
import { useEffect, useRef, useState } from 'react'
import { analysePropertyDefine, createWriteBackValues, decodePropertyDefineJson } from './methods';
import { toRender } from './Ctrls/renderer';

interface IProps {
    defines: string;
    values: Record<string, any>;
    onChange: (values: Record<string, any>, source: { ctrl: TPropertyDefine, path: TPropertyDefine[], value: any }) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { defines, values } = props;
    const definesTemp = useRef<string>('');
    const valuesTemp = useRef<Record<string, any>>(values);
    const [ctrlList, setCtrlList] = useState<IRenderPropertyDefine[]>([]);

    const onChange = (e: any, path: TPropertyDefine[]) => {
        const values = createWriteBackValues(path, e, valuesTemp.current);
        props.onChange(JSON.parse(JSON.stringify(values)), { path, value: e, ctrl: path[path.length - 1] })
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
            {
                ctrlList.map(item => toRender(item, values, onChange))
            }
        </div>
    </>
}

export default Component;
