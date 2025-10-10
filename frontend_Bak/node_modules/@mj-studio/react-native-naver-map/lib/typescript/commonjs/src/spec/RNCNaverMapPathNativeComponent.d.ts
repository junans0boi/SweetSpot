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
type NativeImageProp = undefined | Readonly<{
    symbol?: string;
    rnAssetUri?: string;
    httpUri?: string;
    assetName?: string;
    reuseIdentifier?: string;
}>;
interface Props extends BaseOverlay, ViewProps {
    onTapOverlay?: DirectEventHandler<Readonly<{}>>;
    coords: ReadonlyArray<Coord>;
    width?: Double;
    outlineWidth?: Double;
    patternInterval?: Int32;
    patternImage?: NativeImageProp;
    progress?: Double;
    color?: Int32;
    passedColor?: Int32;
    outlineColor?: Int32;
    passedOutlineColor?: Int32;
    isHideCollidedSymbols?: WithDefault<boolean, false>;
    isHideCollidedMarkers?: WithDefault<boolean, false>;
    isHideCollidedCaptions?: WithDefault<boolean, false>;
}
declare const _default: import("react-native").HostComponent<Props>;
export default _default;
//# sourceMappingURL=RNCNaverMapPathNativeComponent.d.ts.map