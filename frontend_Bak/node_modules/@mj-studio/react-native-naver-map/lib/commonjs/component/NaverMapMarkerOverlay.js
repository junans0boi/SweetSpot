"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NaverMapMarkerOverlay = void 0;
var _objectHash = _interopRequireDefault(require("object-hash"));
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _Util = require("../internal/Util.js");
var _Assert = require("../internal/util/Assert.js");
var _Const = require("../internal/util/Const.js");
var _RNCNaverMapMarkerNativeComponent = _interopRequireDefault(require("../spec/RNCNaverMapMarkerNativeComponent"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const defaultCaptionProps = {
  text: '',
  textSize: 12,
  minZoom: _Const.Const.MIN_ZOOM,
  maxZoom: _Const.Const.MAX_ZOOM,
  color: 'black',
  haloColor: 'transparent',
  requestedWidth: 0
};
const defaultSubCaptionProps = {
  text: '',
  textSize: 10,
  minZoom: _Const.Const.MIN_ZOOM,
  maxZoom: _Const.Const.MAX_ZOOM,
  color: 'black',
  haloColor: 'transparent',
  requestedWidth: 0
};
const NaverMapMarkerOverlay = ({
  latitude,
  longitude,
  zIndex = 0,
  globalZIndex = _Const.Const.NULL_NUMBER,
  isHidden,
  minZoom = _Const.Const.MIN_ZOOM,
  maxZoom = _Const.Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  width = _Const.Const.NULL_NUMBER,
  height = _Const.Const.NULL_NUMBER,
  alpha = 1,
  anchor = {
    x: 0.5,
    y: 1
  },
  angle = 0,
  isFlatEnabled,
  isForceShowIcon,
  isHideCollidedCaptions,
  isHideCollidedMarkers,
  isHideCollidedSymbols,
  isIconPerspectiveEnabled,
  tintColor,
  image = {
    symbol: 'green'
  },
  onTap,
  caption,
  subCaption,
  children
}) => {
  (0, _Assert.nAssert)(_react.Children.count(children) <= 1, `[NaverMapMarkerOverlay] children count should be equal or less than 1, is ${_react.Children.count(children)}`);
  const _caption = (() => {
    const inner = {
      ...defaultCaptionProps,
      ...caption,
      align: (0, _Util.getAlignIntValue)(caption?.align),
      color: (0, _reactNative.processColor)(caption?.color ?? defaultCaptionProps.color),
      haloColor: (0, _reactNative.processColor)(caption?.haloColor ?? defaultCaptionProps.haloColor)
    };
    return {
      ...inner,
      key: (0, _objectHash.default)(inner)
    };
  })();
  const _subCaption = (() => {
    const inner = {
      ...defaultSubCaptionProps,
      ...subCaption,
      color: (0, _reactNative.processColor)(subCaption?.color ?? defaultSubCaptionProps.color),
      haloColor: (0, _reactNative.processColor)(subCaption?.haloColor ?? defaultSubCaptionProps.haloColor)
    };
    return {
      ...inner,
      key: (0, _objectHash.default)(inner)
    };
  })();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RNCNaverMapMarkerNativeComponent.default, {
    coord: {
      latitude,
      longitude
    },
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    width: width,
    height: height,
    alpha: alpha,
    anchor: anchor,
    angle: angle,
    isFlatEnabled: isFlatEnabled,
    isForceShowIcon: isForceShowIcon,
    isHideCollidedCaptions: isHideCollidedCaptions,
    isHideCollidedMarkers: isHideCollidedMarkers,
    isHideCollidedSymbols: isHideCollidedSymbols,
    isIconPerspectiveEnabled: isIconPerspectiveEnabled,
    tintColor: (0, _reactNative.processColor)(tintColor),
    image: (0, _Util.convertJsImagePropToNativeProp)(image),
    onTapOverlay: onTap,
    caption: _caption,
    subCaption: _subCaption,
    children: children
  });
};
exports.NaverMapMarkerOverlay = NaverMapMarkerOverlay;
//# sourceMappingURL=NaverMapMarkerOverlay.js.map