import { type ViewProps } from 'react-native';
import type { DirectEventHandler, Double, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
interface BaseOverlay {
    zIndexValue: Int32;
    globalZIndexValue: Int32;
    isHidden?: WithDefault<boolean, false>;
    minZoom: Double;
    maxZoom: Double;
    isMinZoomInclusive?: WithDefault<boolean, true>;
    isMaxZoomInclusive?: WithDefault<boolean, true>;
}
type Coord = {
    latitude: Double;
    longitude: Double;
};
interface Props extends BaseOverlay, ViewProps {
    onTapOverlay?: DirectEventHandler<Readonly<{}>>;
    coords: ReadonlyArray<Coord>;
    width?: Double;
    color?: Int32;
    pattern?: ReadonlyArray<Int32>;
    capType?: WithDefault<'Round' | 'Butt' | 'Square', 'Round'>;
    joinType?: WithDefault<'Bevel' | 'Miter' | 'Round', 'Round'>;
}
declare const _default: import("react-native").HostComponent<Props>;
export default _default;
//# sourceMappingURL=RNCNaverMapPolylineNativeComponent.d.ts.map