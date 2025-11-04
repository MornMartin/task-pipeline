export type TListener = () => void;

export const HOT_KEY_SPLITTER = '+';

//@todo 需处理窗口失焦后，按键状态未同步的问题
let keydownRecorder: Record<string, KeyboardEvent['code']> = {};

const hotkeyListeners: Record<string, TListener[]> = {
    // ['Control+c']: [],
    // ['Control+v']: [],
    // ['Delete']: [],
};

const isHotkeyMatched = (hotkey: string): boolean => {
    for (const key of hotkey.split(HOT_KEY_SPLITTER)) {
        if (!Object.hasOwn(keydownRecorder, key)) return false;
    }
    return true;
}

const dispatchHotKeyListeners = () => {
    for (const hotkey in hotkeyListeners) {
        if (isHotkeyMatched(hotkey)) {
            hotkeyListeners[hotkey].forEach(listener => {
                listener();
            });
        }
    }
}

const keydownRecorderListener = (e: KeyboardEvent) => {
    const { code, key } = e;
    keydownRecorder[key] = code;
    dispatchHotKeyListeners();
}

const keyupListener = (e: KeyboardEvent) => {
    const { key } = e;
    delete keydownRecorder[key];
}

export const CtrlKey = {
    key: 'Control',
    get down() {
        return !!keydownRecorder[this.key];
    },
    get up() {
        return !keydownRecorder[this.key];
    }
}

export const DeleteKey = {
    key: 'Delete',
    get down() {
        return !!keydownRecorder[this.key];
    },
    get up() {
        return !keydownRecorder[this.key];
    }
}

export const AltKey = {
    key: 'Alt',
    get down() {
        return !!keydownRecorder[this.key];
    },
    get up() {
        return !keydownRecorder[this.key];
    }
}

export const joinHotKey = (...keys: KeyboardEvent['key'][]) => {
    return keys.join(HOT_KEY_SPLITTER);
}

export const enum EHotKey {
    copy,
    cut,
    paste,
    back,
    delete,
}

export const generateHotKey = (type: EHotKey) => {
    if (type === EHotKey.copy) {
        return joinHotKey(CtrlKey.key, 'c');
    }
    if (type === EHotKey.cut) {
        return joinHotKey(CtrlKey.key, 'x');
    }
    if (type === EHotKey.paste) {
        return joinHotKey(CtrlKey.key, 'v');
    }
    if (type === EHotKey.back) {
        return joinHotKey(CtrlKey.key, 'z');
    }
    if (type === EHotKey.delete) {
        return joinHotKey(DeleteKey.key)
    }
    throw Error(`Type ${type} is not valid.`);
}

export const addHotKeyListener = (key: KeyboardEvent['key'] | KeyboardEvent['key'][], listener: TListener) => {
    if (typeof listener !== 'function') throw Error(`${listener} is not a function`);
    const hotkey = joinHotKey(...(Array.isArray(key) ? key : [key]));
    if (hotkeyListeners[hotkey]) {
        hotkeyListeners[hotkey].push(listener);
    } else {
        hotkeyListeners[hotkey] = [listener];
    }
    return () => {
        hotkeyListeners[hotkey] = hotkeyListeners[hotkey].filter(item => item !== listener);
        if (!hotkeyListeners[hotkey].length) {
            delete hotkeyListeners[hotkey];
        }
    }
}

export const install = () => {
    uninstall();
    document.addEventListener('keyup', keyupListener);
    document.addEventListener('keydown', keydownRecorderListener);
}

export const uninstall = () => {
    keydownRecorder = {};
    document.removeEventListener('keyup', keyupListener);
    document.removeEventListener('keydown', keydownRecorderListener);
}