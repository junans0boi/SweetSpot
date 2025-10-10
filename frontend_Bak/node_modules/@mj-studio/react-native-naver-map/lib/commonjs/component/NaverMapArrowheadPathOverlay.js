"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NaverMapArrowheadPathOverlay = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _Assert = require("../internal/util/Assert.js");
var _Const = require("../internal/util/Const.js");
var _RNCNaverMapArrowheadPathNativeComponent = _interopRequireDefault(require("../spec/RNCNaverMapArrowheadPathNativeComponent"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const NaverMapArrowheadPathOverlay = ({
  zIndex = 0,
  globalZIndex = _Const.Const.NULL_NUMBER,
  isHidden,
  minZoom = _Const.Const.MIN_ZOOM,
  maxZoom = _Const.Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  coords = [],
  width = 1,
  color = 'black',
  outlineColor = 'black',
  outlineWidth = 0,
  headSizeRatio = 2.5,
  onTap
}) => {
  if (coords) {
    (0, _Assert.nAssert)(coords.length >= 2, `[NaverMapArrowheadPathOverlay] coords length should be equal or greater than 2, is ${coords.length}.`);
    if (coords.length < 2) return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RNCNaverMapArrowheadPathNativeComponent.default, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    coords: coords,
    width: width,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    color: (0, _reactNative.processColor)(color),
    outlineColor: (0, _reactNative.processColor)(outlineColor),
    outlineWidth: outlineWidth,
    headSizeRatio: headSizeRatio,
    onTapOverlay: onTap
  });
};
exports.NaverMapArrowheadPathOverlay = NaverMapArrowheadPathOverlay;
//# sourceMappingURL=NaverMapArrowheadPathOverlay.js.map