import { TPropertyDefine } from './declare'
import style from './index.module.less'
import { useEffect, useMemo, useRef, useState } from 'react'
import { analysePropertyDefine, decodePropertyDefineJson } from './methods';

interface IProps {
    propertyDefines: string;
    values: Record<string, any>;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { propertyDefines } = props;
    const propertyDefinesTemp = useRef<string>('');
    useEffect(() => {
        if (propertyDefinesTemp.current === propertyDefines) return;
        analysePropertyDefine(decodePropertyDefineJson(propertyDefines));
        propertyDefinesTemp.current = propertyDefines;
    }, [propertyDefines])
    return <>
        <div className={style.PropertyEditor}>Hello</div>
    </>
}

export default Component;
