import { Input } from 'antd';
import { IPropertyTextArea } from '../../declare';
import Label from '../Label';
import style from './index.module.less'
import { useState } from 'react'

interface IProps {
    define: IPropertyTextArea;
    value: string | number;
    onChange: (string) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    return (
        <div className={style.TextArea}>
            <Label label={define?.label}></Label>
            <Input.TextArea value={value} onChange={(e) => onChange(e.target.value)}></Input.TextArea>
        </div>
    )
}

export default Component;
