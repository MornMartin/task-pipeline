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

/**
 * 是否为空对象
 * @param source 
 * @returns 
 */
export const isNull = (source: any) => {
    return source === null;
}

/**
 * 是否为未定义
 * @param source 
 * @returns 
 */
export const isUndefined = (source: any) => {
    return typeof source === 'undefined';
}

/**
 * 是否为空值
 * @param source 
 * @returns 
 */
export const isEmpty = (source: any) => {
    return isNull(source) || isUndefined(source);
}

/**
 * 是否为有效数字
 * @param source 
 * @returns 
 */
export const isNumber = (source: any) => {
    if (isEmpty(source)) {
        return false;
    }
    return !Number.isNaN(Number(source));
}

