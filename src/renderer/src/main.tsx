import './style.less'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App'
import { lowSaturationLight } from './theme'
import '@ant-design/v5-patch-for-react-19'
import locale from 'antd/locale/zh_CN'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigProvider theme={lowSaturationLight} locale={locale}>
            <App />
        </ConfigProvider>
    </StrictMode>
)
