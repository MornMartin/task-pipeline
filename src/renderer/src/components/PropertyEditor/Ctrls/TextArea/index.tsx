import { Input } from 'antd';
import { IPropertyTextArea } from '../../declare';
import Label from '../Label';
import style from './index.module.less'
import { useContext, useEffect, useState } from 'react'
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyTextArea;
    value: string | number;
    onChange: (string) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;

    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [maxlength, setMaxlength] = useState<number>();
    const [resize, setResize] = useState<'none' | 'horizontal'>();

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setMaxlength(propertyGetter(define.params?.maxlength, define) ?? undefined);
        setResize(propertyGetter(define.params?.resize, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.TextArea}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Input.TextArea
                disabled={disabled}
                placeholder={placeholder}
                maxLength={maxlength}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ resize, width: define?.label ? 'var(--ctrl-width)' : '100%' }}
            >
            </Input.TextArea>
        </div>
    )
}

export default Component;
