import { Collapse, CollapseProps, Switch } from 'antd';
import style from './index.module.less'
import { useContext, useEffect, useState } from 'react'
import { IPropertyCollapse, IPropertyCollapseSwitch } from '../../declare';
import { PropertyGetterContext } from '../..';

const defaultKey = 0;

interface IProps {
    define: IPropertyCollapse;
    switchDefine?: IPropertyCollapseSwitch;
    switchValue?: boolean;
    onChange: (e: boolean) => void;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { children, define, switchDefine, switchValue, onChange } = props;
    const [activeKey, setActiveKey] = useState<number[]>([]);

    const rendreTitle = () => {
        return (
            <div className={style.CollapseTitle}>
                <div>{define.label}</div>
                {
                    switchDefine ? <div onClick={e => e.stopPropagation()}>{switchDefine.label} <Switch size='small' value={switchValue} onChange={onChange}></Switch></div> : null
                }

            </div>
        )
    }

    const renderItems = (): CollapseProps['items'] => {
        return [{
            key: defaultKey, label: rendreTitle(), children
        }]

    }

    useEffect(() => {
        setActiveKey(switchValue ? [defaultKey] : []);
    }, [switchValue])

    return <>
        <Collapse activeKey={activeKey} defaultActiveKey={defaultKey} className={style.Collapse} items={renderItems()}></Collapse>
    </>
}

export default Component;
