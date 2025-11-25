import { Slider } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertySlider } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertySlider;
    value: number;
    onChange: (e: number) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [localValue, setLocalValue] = useState<number>(value);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [min, setMin] = useState<number>();
    const [max, setMax] = useState<number>();
    const [step, setStep] = useState<number>();

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setMin(propertyGetter(define.params?.min, define) ?? undefined);
        setMax(propertyGetter(define.params?.max, define) ?? undefined);
        setStep(propertyGetter(define.params?.step, define) ?? undefined);
    }, [propertyGetter, define]);

    useEffect(() => {
        if (value === localValue) return;
        setLocalValue(value);
    }, [value]);

    return (
        <div className={style.Slider}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Slider
                value={localValue}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                style={{ width: define?.label ? 'var(--ctrl-width)' : '100%' }}
                onChange={setLocalValue}
                onChangeComplete={() => onChange(localValue)}
            >
            </Slider>
        </div>
    )
}

export default Component;
