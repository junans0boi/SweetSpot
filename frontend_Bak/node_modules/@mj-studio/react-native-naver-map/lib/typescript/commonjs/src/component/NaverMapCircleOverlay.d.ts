import React from 'react';
import { type ColorValue } from 'react-native';
import type { BaseOverlayProps } from '../types/BaseOverlayProps';
import type { Coord } from '../types/Coord';
export interface NaverMapCircleOverlayProps extends BaseOverlayProps, Coord {
    /** 지도에 원의 반지름을 미터 단위로 표시합니다. */
    radius?: number;
    /**
     * 원의 색상입니다.
     *
     * @default black
     */
    color?: ColorValue;
    /**
     * 외곽선의 굵기입니다. dp(android), pt(ios)
     *
     * @default 0
     */
    outlineWidth?: number;
    /**
     * 외곽선의 색상입니다.
     *
     * @default black
     */
    outlineColor?: ColorValue;
}
export declare const NaverMapCircleOverlay: ({ latitude, longitude, zIndex, globalZIndex, isHidden, minZoom, maxZoom, isMinZoomInclusive, isMaxZoomInclusive, radius, color, outlineWidth, outlineColor, onTap, }: NaverMapCircleOverlayProps) => React.JSX.Element;
//# sourceMappingURL=NaverMapCircleOverlay.d.ts.map