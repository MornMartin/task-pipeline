import { message } from "antd";
import { CSSProperties, JSXElementConstructor, ReactElement } from "react";

const style: CSSProperties = { textAlign: 'right', marginRight: '8px' }

export const errorMsg = (): [(c: string) => void, ReactElement<unknown, string | JSXElementConstructor<any>>] => {
    const [messageApi, contextHolder] = message.useMessage();
    return [
        (content: string) => {
            messageApi.open({ type: 'error', content, style });
        },
        contextHolder
    ]
}