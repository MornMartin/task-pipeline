import { Menu } from 'antd';
import style from './index.module.less'
import { menus, defaultRoute } from '@renderer/route/index'
import { useNavigate } from 'react-router';
import { ReactElement } from 'react';

interface IProps { }

const renderMenuItem = (icon: ReactElement<any, any>, label: string) => {
    return <>
        <span className={style.menuItem}>
            <span style={{ marginRight: '8px' }}>{icon}</span>
            <span>{label}</span>
        </span>
    </>
}

const Component: React.FC<IProps & Record<string, any>> = ({ children }): React.JSX.Element => {
    const navigate = useNavigate();
    return (
        <>
            <div className={style.Layout}>
                <div className={style.menu}>
                    <Menu
                        mode='vertical'
                        items={menus.map(item => {
                            return { key: item.key, label: renderMenuItem(item.icon, item.label) }
                        })}
                        style={{ minWidth: '160px' }}
                        defaultSelectedKeys={[defaultRoute]}
                        onSelect={e => navigate(e.key)}>
                    </Menu>
                </div>
                <div className={style.content}> {children} </div>
            </div>
        </>
    )
}

export default Component;
