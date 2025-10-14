import { createBrowserRouter } from 'react-router';
import { UserOutlined, FundProjectionScreenOutlined, CarryOutOutlined, AppstoreAddOutlined, AppstoreOutlined } from '@ant-design/icons';
import Layout from '@renderer/components/Layout';
import Dashboard from "@renderer/components/Dashboard";
import Designer from "@renderer/components/Designer";
import TaskManager from "@renderer/components/TaskManager";
import JobManager from "@renderer/components/JobManager";
import About from "@renderer/components/About";

const routes = [
    {
        path: '/',
        element: <Layout><Dashboard></Dashboard></Layout>,
        icon: <FundProjectionScreenOutlined />,
        label: '首页'
    },

    {
        path: '/taskDesigner',
        element: <Layout><Designer></Designer></Layout>,
        icon: <AppstoreAddOutlined />,
        label: '设计器'
    },
    {
        path: '/taskManager',
        element: <Layout><TaskManager></TaskManager></Layout>,
        icon: <AppstoreOutlined />,
        label: '流水线管理'
    },
    {
        path: '/jobManager',
        element: <Layout><JobManager></JobManager></Layout>,
        icon: <CarryOutOutlined />,
        label: '任务管理'
    },
    {
        path: '/about',
        element: <Layout><About></About></Layout>,
        icon: <UserOutlined />,
        label: '关于'
    }
]

export const router = createBrowserRouter(routes)

export const menus = routes.map(item => {
    return { key: item.path, icon: item.icon, label: item.label };
})

export const defaultRoute = '/';

export { RouterProvider } from 'react-router';
