"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NaverMapMultiPathOverlay = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _Util = require("../internal/Util.js");
var _Assert = require("../internal/util/Assert.js");
var _Const = require("../internal/util/Const.js");
var _RNCNaverMapMultiPathNativeComponent = _interopRequireDefault(require("../spec/RNCNaverMapMultiPathNativeComponent"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const NaverMapMultiPathOverlay = ({
  pathParts,
  globalZIndex = _Const.Const.NULL_NUMBER,
  isHidden,
  isHideCollidedCaptions,
  isHideCollidedMarkers,
  isHideCollidedSymbols,
  isMaxZoomInclusive,
  isMinZoomInclusive,
  maxZoom = _Const.Const.MAX_ZOOM,
  minZoom = _Const.Const.MIN_ZOOM,
  onTap,
  outlineWidth = 0,
  patternImage,
  patternInterval = 0,
  progress = 0,
  width = 1,
  zIndex = 0
}) => {
  // Validate pathParts
  if (pathParts.length === 0) return null;

  // Validate each path part has at least 2 coordinates
  pathParts.forEach((pathPart, index) => {
    (0, _Assert.nAssert)(pathPart.coords.length >= 2, `[NaverMapMultiPathOverlay] pathParts[${index}].coords length should be equal or greater than 2, is ${pathPart.coords.length}.`);
  });
  if (pathParts.some(pathPart => pathPart.coords.length < 2)) return null;

  // Process pathParts to native format with useMemo
  const processedPathParts = (0, _react.useMemo)(() => {
    return pathParts.map(pathPart => ({
      coords: pathPart.coords,
      color: (0, _reactNative.processColor)(pathPart.color || 'black'),
      passedColor: (0, _reactNative.processColor)(pathPart.passedColor || 'black'),
      outlineColor: (0, _reactNative.processColor)(pathPart.outlineColor || 'black'),
      passedOutlineColor: (0, _reactNative.processColor)(pathPart.passedOutlineColor || 'black')
    }));
  }, [pathParts]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RNCNaverMapMultiPathNativeComponent.default, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    pathParts: processedPathParts,
    width: width,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    isHideCollidedCaptions: isHideCollidedCaptions,
    isHideCollidedMarkers: isHideCollidedMarkers,
    isHideCollidedSymbols: isHideCollidedSymbols,
    patternImage: patternImage ? (0, _Util.convertJsImagePropToNativeProp)(patternImage) : undefined,
    patternInterval: patternInterval,
    progress: progress,
    outlineWidth: outlineWidth,
    onTapOverlay: onTap
  });
};
exports.NaverMapMultiPathOverlay = NaverMapMultiPathOverlay;
//# sourceMappingURL=NaverMapMultiPathOverlay.js.map