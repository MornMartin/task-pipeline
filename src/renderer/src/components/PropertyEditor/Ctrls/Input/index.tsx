import { Input } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertyInput } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyInput;
    value: string | number;
    onChange: (string) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [maxlength, setMaxlength] = useState<number>();

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setMaxlength(propertyGetter(define.params?.maxlength, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.Input}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Input
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={maxlength}
                style={{ width: define?.label ? 'var(--ctrl-width)' : '100%' }}
                onChange={(e) => onChange(e.target.value)}
            >
            </Input>
        </div>
    )
}

export default Component;
