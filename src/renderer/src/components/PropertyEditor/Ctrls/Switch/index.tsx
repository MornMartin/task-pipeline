import { Switch } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useState } from 'react'
import { IPropertySwitch } from '../../declare';
import { PropertyGetterContext } from '../..';

interface IProps {
    define: IPropertySwitch;
    value: boolean;
    onChange: (e: boolean) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
    }, [propertyGetter, define]);
    return (
        <div className={style.Switch}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <Switch value={value} disabled={disabled} onChange={(e) => onChange(e)}></Switch>
        </div>
    )
}

export default Component;
