import { Input } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useState } from 'react'
import { IPropertyInput } from '../../declare';

interface IProps {
    define: IPropertyInput;
    value: string | number;
    onChange: (string) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    return (
        <div className={style.Input}>
            <Label label={define?.label}></Label>
            <Input value={value} onChange={(e) => onChange(e.target.value)}></Input>
        </div>
    )
}

export default Component;
