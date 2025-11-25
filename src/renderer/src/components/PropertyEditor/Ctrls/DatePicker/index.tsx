import { DatePicker } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IPropertyDatePicker } from '../../declare';
import { PropertyGetterContext } from '../..';
import dayjs from 'dayjs';

interface IProps {
    define: IPropertyDatePicker;
    value: string;
    onChange: (e: string) => void;
}

const current = new Date();

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value } = props;
    const wrap = useRef<HTMLDivElement>(null);
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [allowClear, setAllowClear] = useState<boolean>();
    const [mode, setMode] = useState<'time' | 'date' | 'month' | 'year'>();
    const [format, setFormat] = useState<string>();

    const showTime = useMemo(() => mode === 'time', [mode]);
    const calcMode = useMemo(() => mode === 'time' ? 'date' : mode, [mode]);
    const localeValue = useMemo(() => {
        if (!value) return null;
        const targetDateTime = dayjs(new Date(value).toLocaleString());
        return targetDateTime.isValid() ? targetDateTime : null;
    }, [value]);

    const onChange = (date: dayjs.Dayjs, dateString: string | string[]) => {
        const value = Array.isArray(dateString) ? dateString.pop() : dateString;
        props.onChange(value as string);
    }

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setPlaceholder(propertyGetter(define.params?.placeholder, define) ?? undefined);
        setAllowClear(propertyGetter(define.params?.allowClear, define) ?? undefined);
        setMode(propertyGetter(define.params?.mode, define) ?? undefined);
        setFormat(propertyGetter(define.params?.format, define) ?? undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.DatePicker} ref={wrap}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <DatePicker
                value={localeValue}
                disabled={disabled}
                placeholder={placeholder}
                allowClear={allowClear}
                picker={calcMode}
                showTime={showTime}
                format={format}
                onChange={onChange}
                style={{ width: define?.label ? 'var(--ctrl-width)' : '100%' }}
                getPopupContainer={e => wrap.current as HTMLDivElement}
            >
            </DatePicker>
        </div>
    )
}

export default Component;
