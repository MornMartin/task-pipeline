/**
 * 创建防抖函数
 * @param delay 
 * @returns 
 */
export const debounce = (delay = 100) => {
    let timer;
    return (hanlder: () => void) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            typeof hanlder === 'function' && hanlder();
        }, delay);
    }
}

/**
 * 创建唯一ID
 * @returns 
 */
export const createUUID = () => {
    return window.crypto.randomUUID();
}
