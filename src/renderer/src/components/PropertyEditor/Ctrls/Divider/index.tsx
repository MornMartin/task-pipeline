import { Divider } from 'antd';
import style from './index.module.less'
import { useContext, useEffect, useState } from 'react'
import { IPropertyDivider } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyDivider;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [type, setType] = useState<'horizontal' | 'vertical'>();
    const [variant, setVariant] = useState<'dashed' | 'dotted' | 'solid'>();
    const [lineColor, setLineColor] = useState<string>();
    const [labelColor, setLabelColor] = useState<string>();

    useEffect(() => {
        setType(propertyGetter(define.params?.type, define) ?? undefined);
        setVariant(propertyGetter(define.params?.variant, define) ?? undefined);
        setLineColor(propertyGetter(define.params?.lineColor, define) ?? undefined);
        setLabelColor(propertyGetter(define.params?.labelColor, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.Divider}>
            <Divider type={type} variant={variant} style={{ borderBlockColor: lineColor }}>
                <span style={{ color: labelColor }}>{define.label}</span>
            </Divider>
        </div>
    )
}

export default Component;
