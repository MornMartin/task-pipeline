import { Checkbox } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useMemo, useState } from 'react'
import { IPropertyCheckbox } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertyCheckbox;
    value: (string | number)[];
    onChange: (e: (string | number)[]) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value = [], onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [options, setOptions] = useState<{ label: any, value: any }[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');

    useEffect(() => {
        setOptions(propertyGetter(define.params?.options, define) || []);
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setLayout(propertyGetter(define.params?.layout, define) ?? 'vertical');
    }, [propertyGetter, define]);

    return (
        <div className={style.Checkbox} style={{ ['--flex-direction']: layout === 'vertical' ? 'column' : 'row' } as any}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Checkbox.Group disabled={disabled} onChange={onChange}>
                {
                    options.map(item => {
                        return <Checkbox checked={value.includes(item.value)} value={item.value} key={item.value}>{item.label}</Checkbox>
                    })
                }
            </Checkbox.Group>
        </div>
    )
}

export default Component;
