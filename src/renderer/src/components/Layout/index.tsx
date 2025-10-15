import { Menu } from 'antd';
import style from './index.module.less'
import { menus, defaultRoute, assignNavegateParams, router } from '@renderer/route/index'
import { useNavigate } from 'react-router';
import { ReactElement, useMemo } from 'react';

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
    const onSelect = (e) => {
        navigate(assignNavegateParams(e.key, {}));
    }
    return (
        <>
            <div className={style.Layout}>
                <div className={style.menu}>
                    <Menu
                        mode='vertical'
                        items={menus.map(item => {
                            return { key: item.key as string, label: renderMenuItem(item.icon, item.label) }
                        })}
                        style={{ minWidth: '160px' }}
                        selectedKeys={router.state.matches.map(item => item.route.path as string)}
                        onSelect={onSelect}>
                    </Menu>
                </div>
                <div className={style.content}> {children} </div>
            </div>
        </>
    )
}

export default Component;
