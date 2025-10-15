import { ElectronAPI } from '@electron-toolkit/preload'

export interface IApi {
    callStorage: (...arg) => Promise<any>;
}

declare global {
    interface Window {
        electron: ElectronAPI
        api: IApi
    }
}
