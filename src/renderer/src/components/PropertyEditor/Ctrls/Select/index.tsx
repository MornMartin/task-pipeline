import { Select } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertySelect } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertySelect;
    value: string | number;
    onChange: (e: string | number) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [options, setOptions] = useState<{ label: string, value: string }[]>();

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setOptions(propertyGetter(define.params?.options, define) || []);
    }, [propertyGetter, define]);

    return (
        <div className={style.Select}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Select
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                options={options}
                style={{ width: 'var(--ctrl-width)' }}
                onChange={(e) => onChange(e)}
            >
            </Select>
        </div>
    )
}

export default Component;
