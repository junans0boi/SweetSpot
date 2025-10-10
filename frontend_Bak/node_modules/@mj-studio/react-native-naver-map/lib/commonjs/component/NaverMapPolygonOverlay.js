"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NaverMapPolygonOverlay = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _Assert = require("../internal/util/Assert.js");
var _Const = require("../internal/util/Const.js");
var _RNCNaverMapPolygonNativeComponent = _interopRequireDefault(require("../spec/RNCNaverMapPolygonNativeComponent"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const NaverMapPolygonOverlay = ({
  zIndex = 0,
  globalZIndex = _Const.Const.NULL_NUMBER,
  isHidden,
  minZoom = _Const.Const.MIN_ZOOM,
  maxZoom = _Const.Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  coords = [],
  holes = [],
  color = 'black',
  outlineWidth = 0,
  outlineColor = 'black',
  onTap
}) => {
  if (coords) {
    (0, _Assert.nAssert)(coords.length >= 3, `[NaverMapPolygonOverlay] coords length should be equal or greater than 3, is ${coords.length}.`);
  }
  if (holes) {
    for (const hole of holes) {
      (0, _Assert.nAssert)(hole.length >= 3, `[NaverMapPolygonOverlay] hole length should be equal or greater than 3, is ${hole.length}.`);
    }
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RNCNaverMapPolygonNativeComponent.default, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    geometries: {
      coords,
      holes
    },
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    color: (0, _reactNative.processColor)(color),
    outlineWidth: outlineWidth,
    outlineColor: (0, _reactNative.processColor)(outlineColor),
    onTapOverlay: onTap
  });
};
exports.NaverMapPolygonOverlay = NaverMapPolygonOverlay;
//# sourceMappingURL=NaverMapPolygonOverlay.js.map