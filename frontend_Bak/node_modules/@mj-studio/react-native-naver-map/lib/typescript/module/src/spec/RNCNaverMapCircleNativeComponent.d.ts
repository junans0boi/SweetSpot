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
interface Props extends BaseOverlay, ViewProps {
    coord: Readonly<{
        latitude: Double;
        longitude: Double;
    }>;
    onTapOverlay?: DirectEventHandler<Readonly<{}>>;
    radius?: Double;
    color?: Int32;
    outlineColor?: Int32;
    outlineWidth?: Double;
}
declare const _default: import("react-native").HostComponent<Props>;
export default _default;
//# sourceMappingURL=RNCNaverMapCircleNativeComponent.d.ts.map