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
export type NativeImageProp = undefined | Readonly<{
    symbol?: string;
    rnAssetUri?: string;
    httpUri?: string;
    assetName?: string;
    reuseIdentifier?: string;
}>;
type Region = {
    latitude: Double;
    longitude: Double;
    latitudeDelta: Double;
    longitudeDelta: Double;
};
interface Props extends BaseOverlay, ViewProps {
    onTapOverlay?: DirectEventHandler<Readonly<{}>>;
    image: NativeImageProp;
    region: Region;
}
declare const _default: import("react-native").HostComponent<Props>;
export default _default;
//# sourceMappingURL=RNCNaverMapGroundNativeComponent.d.ts.map