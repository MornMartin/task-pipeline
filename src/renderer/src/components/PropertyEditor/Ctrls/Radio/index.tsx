import { Radio } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertyRadio } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyRadio;
    value: string | number;
    onChange: (e: string | number) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [options, setOptions] = useState<{ label: any, value: any }[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [isBlock, setIsBlock] = useState<boolean>(false);
    const [optionType, setOptionType] = useState<'default' | 'button'>();
    const [buttonStyle, setButtonStyle] = useState<'outline' | 'solid'>();

    useEffect(() => {
        setOptions(propertyGetter(define.params?.options, define) || []);
        setDisabled(propertyGetter(define.params?.disabled, define) || false);
        setIsBlock(propertyGetter(define.params?.isBlock, define) || undefined);
        setOptionType(propertyGetter(define.params?.optionType, define) || undefined);
        setButtonStyle(propertyGetter(define.params?.buttonStyle, define) || undefined);
    }, [propertyGetter, define]);

    return (
        <div className={style.Radio}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Radio.Group
                value={value}
                disabled={disabled}
                options={options}
                block={isBlock}
                optionType={optionType}
                buttonStyle={buttonStyle}
                style={{ width: 'var(--ctrl-width)' }}
                onChange={(e) => onChange(e.target.value)}
            >
            </Radio.Group>
        </div>
    )
}

export default Component;
