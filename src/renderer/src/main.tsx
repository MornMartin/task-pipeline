import './style.less'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App'
import { lowSaturationLight } from './theme'

console.log(window.electron)
console.log(window.api)

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigProvider theme={lowSaturationLight}>
            <App />
        </ConfigProvider>
    </StrictMode>
)
