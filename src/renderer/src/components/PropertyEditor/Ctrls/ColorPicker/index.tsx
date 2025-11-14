import { ColorPicker } from 'antd';
import style from './index.module.less'
import Label from '../Label/index';
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IPropertyColorPicker } from '../../declare';
import { PropertyGetterContext } from '../..';
import { createUUID, debounce } from '@renderer/utils/methods';

interface IProps {
    define: IPropertyColorPicker;
    value: string;
    onChange: (e: string) => void;
}

const nullColor = '';

enum EColorType {
    null = 'null',
    solid = 'solid',
    linearGradient = 'linear-gradient',
    radialGradient = 'radial-gradient',
}

interface IColor {
    type: EColorType;
    colors: IColorParam[];
    param?: string;
}

interface IColorParam {
    color: string, percent: number
}

type TBindColor = string | IColorParam[];

const changeDebounce = debounce(50);

/**
 * 将颜色字符串转为Color
 * @param color 
 * @returns 
 */
const transColorStr2Color = (color: string): IColor => {
    if (!color) {
        return {
            type: EColorType.null,
            colors: [{ color: nullColor, percent: 0 }],
        }
    }
    const matchGradientHead = /^(linear|radial)-gradient\(/;
    const matchGradientTail = /\)$/;
    if (matchGradientHead.test(color) && matchGradientTail.test(color)) {

        const matchRgb = /rgb\((\s*\d{1,3}\s*),(\s*\d{1,3}\s*),(\s*\d{1,3}\s*)\)/gi;
        const matchRgba = /rgba\((\s*\d{1,3}\s*),(\s*\d{1,3}\s*),(\s*\d{1,3}\s*),\s*(0|1|0?\.\d+\s*)\)/gi;
        const matchHsb = /hsb\((\s*\d{1,3}\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*)\)/gi;
        const matchHsba = /hsba\((\s*\d{1,3}\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*),(\s*\d{1,3}%\s*)\)/gi;
        const matchHex = /#([a-fA-F0-9]{8}|[a-fA-F0-9]{6}|[a-fA-F0-9]{3})/gi;

        const [type] = /(linear|radial)-gradient/.exec(color) || [];
        const droppedGradientDecoration = color.replace(matchGradientHead, '').replace(matchGradientTail, '');
        const colorMap = {};
        let gradientParamString = droppedGradientDecoration;
        [matchRgb, matchRgba, matchHsb, matchHsba, matchHex].forEach(regx => {
            gradientParamString = gradientParamString.replaceAll(regx, e => {
                const hash = createUUID();
                colorMap[hash] = e;
                return hash;
            })
        });
        const [param, ...colors] = gradientParamString.split(/\s*,\s*/)
        colors.map(item => {
            const [colorId, percent] = item.split(/\s+/);
            if (colorMap[colorId] && /%$/.test(percent)) {
                return {
                    color: colorMap[colorId],
                    percent: Number.parseInt(percent)
                }
            }
            return null;
        });
        return {
            type: type as (EColorType.linearGradient | EColorType.radialGradient),
            colors: colors.map(item => {
                const [colorId, percent] = item.split(/\s+/);
                if (colorMap[colorId] && /%$/.test(percent)) {
                    return {
                        color: colorMap[colorId],
                        percent: Number.parseInt(percent)
                    }
                }
                return null;
            }).filter(item => !!item),
            param: param,
        }
    }
    return {
        type: EColorType.solid,
        colors: [{ color, percent: 0 }]
    };
}

/**
 * 将Color转为颜色字符串
 * @param color 
 * @returns 
 */
const transColor2ColorStr = (color: IColor): string => {
    const { type, colors, param } = color;
    if (type === EColorType.solid) {
        const [color] = colors;
        return color?.color || nullColor;
    }
    if (type === EColorType.linearGradient || type === EColorType.radialGradient) {
        return `linear-gradient(${param}, ${colors.map(item => `${item.color} ${item.percent}%`).join(', ')})`
    }
    return nullColor;
}

/**
 * 将Color转为组件BindColor
 * @param color 
 * @returns 
 */
const transColor2BindColor = (color: IColor): TBindColor => {
    const { type, colors } = color;
    if (type === EColorType.solid) {
        const [color] = colors;
        return color?.color
    }
    if (type === EColorType.linearGradient || type === EColorType.radialGradient) {
        return colors;
    }
    return nullColor
}

const Component: React.FC<IProps & Record<string, any>> = (props): React.JSX.Element => {
    const { define, value, onChange } = props;
    const wrap = useRef<HTMLDivElement>(null);
    const propertyGetter = useContext(PropertyGetterContext);

    const [disabled, setDisabled] = useState<boolean>(false);
    const [allowClear, setAllowClear] = useState<boolean>(false);
    const [format, setFormat] = useState<'rgb' | 'hex' | 'hsb'>('rgb');
    const [mode, setMode] = useState<'single' | 'gradient' | ('single' | 'gradient')[]>('single');

    const [localColor, setLocalColor] = useState<IColor>(transColorStr2Color(value));
    const [bindColor, setBindColor] = useState<TBindColor>(transColor2BindColor(transColorStr2Color(value)));

    useEffect(() => {
        setDisabled(propertyGetter(define.params?.disabled, define) ?? false);
        setAllowClear(propertyGetter(define.params?.allowClear, define) ?? undefined);
        setFormat(propertyGetter(define.params?.format, define) ?? undefined);
        setMode(propertyGetter(define.params?.mode, define) ?? undefined);
    }, [propertyGetter, define]);

    useEffect(() => {
        if (value === bindColor) return;
        if (value === transColor2ColorStr(localColor)) return;
        setLocalColor(transColorStr2Color(value));
        setBindColor(transColor2BindColor(transColorStr2Color(value)));
    }, [value])

    return (
        <div className={style.ColorPicker} ref={wrap}>
            {define?.label ? <Label label={define?.label}></Label> : null}
            <ColorPicker
                value={bindColor}
                disabled={disabled}
                allowClear={allowClear}
                format={format}
                mode={mode}
                onChange={(e, css) => changeDebounce(() => onChange(css))}
                showText={true}
                style={{ width: 'var(--ctrl-width)', justifyContent: 'start' }}
                getPopupContainer={e => wrap.current as HTMLElement}
            >
            </ColorPicker>
        </div>
    )
}

export default Component;
