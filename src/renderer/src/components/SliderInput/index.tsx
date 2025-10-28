import { InputNumber, InputNumberProps, Slider } from 'antd';
import style from './index.module.less'
import { useEffect, useMemo, useState } from 'react'

interface IProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange: (e: number) => void;
}

const getValidValue = (v: string | number, min: number, max: number): number => {
    const numbered = Number(v);
    return Number.isNaN(numbered) ? min : Math.max(Math.min(numbered, max), min)
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { min = 0, max = 1, step = 0.01, value, onChange: onValueChange } = props || {};
    const [currentValue, setValidValue] = useState(getValidValue(value ?? min, min, max));

    const onChange: InputNumberProps['onChange'] = (value) => {
        if (Number.isNaN(value)) return;
        setValidValue(value as number);
        onValueChange(value as number);
    };
    useMemo(() => {
        const targetValue = getValidValue(value ?? min, min, max);
        if (targetValue === currentValue) return;
        onChange(getValidValue(value ?? min, min, max))
    }, [value, currentValue])
    return <>
        <div className={style.SliderInput}>
            <Slider
                min={min}
                max={max}
                step={step}
                onChange={onChange}
                value={currentValue}
                style={{ width: '120px' }}
            />
            <InputNumber
                min={min}
                max={max}
                step={step}
                style={{ marginLeft: '8px', width: '64px', background: '#eee', borderRadius: '0' }}
                value={currentValue}
                controls={false}
                size='small'
                onChange={onChange}
            />
        </div>
    </>
}

export default Component;
