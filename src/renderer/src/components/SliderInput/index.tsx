import { InputNumber, InputNumberProps, Slider } from 'antd';
import style from './index.module.less'
import { useMemo, useState } from 'react'

interface IProps {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    onChange: (e: number) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { min = 0, max = 1, step = 0.01, defaultValue, onChange: onValueChange } = props || {};
    const [inputValue, setInputValue] = useState(typeof defaultValue === 'number' ? defaultValue : min);

    const value = useMemo(() => inputValue, [inputValue]);

    const onChange: InputNumberProps['onChange'] = (value) => {
        if (Number.isNaN(value)) {
            return;
        }
        setInputValue(value as number);
        onValueChange(value as number);
    };
    return <>
        <div className={style.SliderInput}>
            <Slider
                min={min}
                max={max}
                step={step}
                onChange={onChange}
                value={typeof value === 'number' ? value : 0}
                style={{ width: '120px' }}
            />
            <InputNumber
                min={min}
                max={max}
                step={step}
                style={{ marginLeft: '8px', width: '64px', background: '#eee', borderRadius: '0' }}
                value={value}
                controls={false}
                size='small'
                onChange={onChange}
            />
        </div>
    </>
}

export default Component;
