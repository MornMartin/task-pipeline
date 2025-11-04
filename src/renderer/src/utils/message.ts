import { message } from "antd";
import { NoticeType } from "antd/es/message/interface";
import { CSSProperties, JSXElementConstructor, ReactElement } from "react";

const style: CSSProperties = { textAlign: 'center' }

export const useMessage = (defaultType?: NoticeType): [(c: string, type?: NoticeType) => void, ReactElement<unknown, string | JSXElementConstructor<any>>] => {
    const [messageApi, contextHolder] = message.useMessage();
    return [
        (content: string, type?: NoticeType) => {
            messageApi.open({ type: type ?? defaultType, content, style });
        },
        contextHolder
    ]
}

export const useErrorMsg = (): [(c: string) => void, ReactElement<unknown, string | JSXElementConstructor<any>>] => {
    return useMessage('error');
}
