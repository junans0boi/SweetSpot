import React from 'react';
import { type ColorValue } from 'react-native';
import type { BaseOverlayProps } from '../types/BaseOverlayProps';
import type { Coord } from '../types/Coord';
export interface NaverMapArrowheadPathOverlayProps extends BaseOverlayProps {
    /**
     *  좌표열을 지정할 수 있습니다.
     *  좌표열은 필수적인 속성으로, 좌표열을 지정하지 않은 경로선 오버레이는 지도에 추가되지 않습니다.
     *  또한 좌표열의 크기가 2 미만이거나 null인 원소가 있을 경우에도 지도에 추가되지 않습니다.
     */
    coords: Coord[];
    /**
     * 두께를 지정할 수 있습니다.
     *
     * dp, pt단위입니다.
     *
     * @default 1
     */
    width?: number;
    /**
     * 테두리의 두께를 지정할 수 있습니다. 0으로 지정하면 테두리가 그려지지 않습니다.
     *
     * @default 0
     */
    outlineWidth?: number;
    /**
     * color와 passedColor 속성을 사용해 각각 지나갈, 지나온 경로선의 색상을 지정할 수 있습니다.
     *
     * @default black
     */
    color?: ColorValue;
    /**
     * 외곽선 색상입니다.
     *
     * @default black
     */
    outlineColor?: ColorValue;
    /**
     * 머리 크기의 배율을 지정할 수 있습니다. 두께에 배율을 곱한 값이 머리의 크기가 됩니다.
     *
     * @default 2.5
     */
    headSizeRatio?: number;
}
export declare const NaverMapArrowheadPathOverlay: ({ zIndex, globalZIndex, isHidden, minZoom, maxZoom, isMinZoomInclusive, isMaxZoomInclusive, coords, width, color, outlineColor, outlineWidth, headSizeRatio, onTap, }: NaverMapArrowheadPathOverlayProps) => React.JSX.Element | null;
//# sourceMappingURL=NaverMapArrowheadPathOverlay.d.ts.map