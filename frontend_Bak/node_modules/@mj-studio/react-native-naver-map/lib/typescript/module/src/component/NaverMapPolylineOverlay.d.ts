import React from 'react';
import { type ColorValue } from 'react-native';
import type { BaseOverlayProps } from '../types/BaseOverlayProps';
import type { CapType } from '../types/CapType';
import type { Coord } from '../types/Coord';
import type { JoinType } from '../types/JoinType';
export interface NaverMapPolylineOverlayProps extends BaseOverlayProps {
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
     * color속성을 사용해 선의 색상을 지정할 수 있습니다.
     *
     * @default black
     */
    color?: ColorValue;
    pattern?: number[];
    /**
     * capType 속성을 사용해 끝 지점의 모양을 지정할 수 있습니다.
     *
     * 다음 그림은 위에서부터 차례대로 Round, Butt, Square 모양을 나타냅니다.
     *
     * <img src="https://navermaps.github.io/ios-map-sdk/assets/5-4-captype.png" width="300" alt="preview">
     *
     * @see {@link CapType}
     * @default Round
     */
    capType?: CapType;
    /**
     * joinType 속성을 사용해 연결점의 모양을 지정할 수 있습니다.
     *
     * 다음 그림은 위에서부터 차례대로 Round, Butt, Square 모양을 나타냅니다.
     *
     * <img src="https://navermaps.github.io/ios-map-sdk/assets/5-4-join-bevel.png" width="300" alt="preview">
     * <img src="https://navermaps.github.io/ios-map-sdk/assets/5-4-join-miter.png" width="300" alt="preview">
     * <img src="https://navermaps.github.io/ios-map-sdk/assets/5-4-join-round.png" width="300" alt="preview">
     *
     * @see {@link JoinType}
     * @default Round
     */
    joinType?: JoinType;
}
export declare const NaverMapPolylineOverlay: ({ zIndex, globalZIndex, isHidden, minZoom, maxZoom, isMinZoomInclusive, isMaxZoomInclusive, coords, width, capType, joinType, color, onTap, }: NaverMapPolylineOverlayProps) => React.JSX.Element;
//# sourceMappingURL=NaverMapPolylineOverlay.d.ts.map