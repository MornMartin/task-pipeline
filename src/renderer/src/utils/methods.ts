export const debounce = (delay = 100) => {
    let timer;
    return (hanlder: () => void) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            typeof hanlder === 'function' && hanlder();
        }, delay);
    }
}