import { createBrowserRouter, RouteObject } from 'react-router';
import { UserOutlined, FundProjectionScreenOutlined, CarryOutOutlined, AppstoreAddOutlined, AppstoreOutlined } from '@ant-design/icons';
import Layout from '@renderer/components/Layout';
import Dashboard from "@renderer/components/Dashboard";
import PipelineCanvas from "@renderer/components/PipelineCanvas";
import PipelineDesigner from "@renderer/components/PipelineDesigner";
import PipelineManager from "@renderer/components/PipelineManager";
import JobManager from "@renderer/components/JobManager";
import About from "@renderer/components/About";

const routes: (RouteObject & Record<string, any>)[] = [
    {
        path: '/',
        element: <Layout><Dashboard></Dashboard></Layout>,
        icon: <FundProjectionScreenOutlined />,
        label: '首页',
    },

    {
        path: '/pipelineDesigner',
        children: [
            { index: true, element: <Layout><PipelineDesigner></PipelineDesigner></Layout> },
            {
                path: ":id",
                element: <PipelineCanvas></PipelineCanvas>,
                loader: async ({ params }) => {
                    return params;
                },
            },
        ],
        icon: <AppstoreAddOutlined />,
        label: '流水线设计'
    },
    {
        path: '/pipelineManager',
        element: <Layout><PipelineManager></PipelineManager></Layout>,
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

export const assignNavegateParams = (path: string, params: Record<string, string | number>) => {
    return path.replaceAll(/:[a-zA-Z0-9]+/g, e => {
        return `${params[e.replace(/^:/, '')] || ''}`;
    })
}

export const defaultRoute = '/';

export { RouterProvider } from 'react-router';
