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
    geometries: Readonly<{
        coords: ReadonlyArray<Coord>;
        holes: ReadonlyArray<ReadonlyArray<Coord>>;
    }>;
    color?: Int32;
    outlineColor?: Int32;
    outlineWidth?: Double;
}
declare const _default: import("react-native").HostComponent<Props>;
export default _default;
//# sourceMappingURL=RNCNaverMapPolygonNativeComponent.d.ts.map