import { InputNumber } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertyInputNumber } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyInputNumber;
    value: number;
    onChange: (e: number) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [min, setMin] = useState<number>();
    const [max, setMax] = useState<number>();
    const [precision, setPrecision] = useState<number>();
    const [controls, setControls] = useState<boolean>();

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setMin(propertyGetter(define.params?.min, define) ?? undefined);
        setMax(propertyGetter(define.params?.max, define) ?? undefined);
        setPrecision(propertyGetter(define.params?.precision, define) ?? undefined);
        setControls(propertyGetter(define.params?.controls, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.InputNumber}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <InputNumber
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                min={min}
                max={max}
                precision={precision}
                controls={controls}
                style={{ width: define?.label ? 'var(--ctrl-width)' : '100%' }}
                onChange={(e) => onChange(e as number)}
            >
            </InputNumber>
        </div>
    )
}

export default Component;
