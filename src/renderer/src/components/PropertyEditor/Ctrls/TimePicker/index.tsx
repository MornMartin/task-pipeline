import { TimePicker } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IPropertyTimePicker } from '../../declare';
import { PropertyGetterContext } from '../..';
import dayjs from 'dayjs';

interface IProps {
    define: IPropertyTimePicker;
    value: string;
    onChange: (e: string) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value } = props;
    const wrap = useRef<HTMLDivElement>(null);
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [allowClear, setAllowClear] = useState<boolean>();
    const [format, setFormat] = useState<string>();

    const localeValue = useMemo(() => {
        if (!value) return null;
        const targetDateTime = dayjs(`${new Date().toLocaleDateString()} ${value}`)
        return targetDateTime.isValid() ? targetDateTime : null;
    }, [value]);

    const onChange = (date: dayjs.Dayjs, timeString: string | string[]) => {
        const value = Array.isArray(timeString) ? timeString.pop() : timeString;
        props.onChange(value as string);
    }

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setAllowClear(propertyGetter(define.params?.allowClear, define) ?? undefined);
        setFormat(propertyGetter(define.params?.format, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.TimePicker}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <TimePicker
                value={localeValue}
                disabled={disabled}
                format={format}
                allowClear={allowClear}
                placeholder={placeholder}
                onChange={onChange}
                style={{ width: define?.label ? 'var(--ctrl-width)' : '100%' }}
                getPopupContainer={e => wrap.current as HTMLDivElement}
            >
            </TimePicker>
        </div>
    )
}

export default Component;
