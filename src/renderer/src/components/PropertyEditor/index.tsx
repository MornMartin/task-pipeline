import { IRenderPropertyDefine, TPropertyDefine } from './declare'
import style from './index.module.less'
import { useEffect, useMemo, useRef, useState } from 'react'
import { analysePropertyDefine, createWriteBackValues, decodePropertyDefineJson } from './methods';
import { toRender } from './Ctrls/renderer';

interface IProps {
    propertyDefines: string;
    values: Record<string, any>;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { propertyDefines } = props;
    const propertyDefinesTemp = useRef<string>('');
    const valuesTemp = useRef<Record<string, any>>({});
    const [values, setValues] = useState<Record<string, any>>({});
    const [ctrlList, setCtrlList] = useState<IRenderPropertyDefine[]>([]);

    const onChange = (e: any, path: TPropertyDefine[]) => {
        setValues(createWriteBackValues(path, e, valuesTemp.current, (path, ctrl) => {
            return 0;
        }));
    }

    useEffect(() => {
        if (propertyDefinesTemp.current === propertyDefines) return;
        const { defaults, decoratedCtrls } = analysePropertyDefine(decodePropertyDefineJson(propertyDefines));
        setValues(defaults);
        setCtrlList(decoratedCtrls);
        propertyDefinesTemp.current = propertyDefines;
    }, [propertyDefines]);
    useEffect(() => {
        valuesTemp.current = { ...values };
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
