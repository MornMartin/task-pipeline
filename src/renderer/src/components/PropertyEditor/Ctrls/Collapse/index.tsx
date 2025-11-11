import { Collapse } from 'antd';
import style from './index.module.less'
import { useState } from 'react'
import { IPropertyCollapse } from '../../declare';

const defaultKey = 0;

interface IProps {
    define: IPropertyCollapse;
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { children, define } = props;
    return <>
        <Collapse defaultActiveKey={defaultKey} className={style.Collapse}>
            <Collapse.Panel header={define.label} key={defaultKey}>
                {children}
            </Collapse.Panel>
        </Collapse>
    </>
}

export default Component;
