"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NaverMapGroundOverlay = void 0;
var _react = _interopRequireDefault(require("react"));
var _Util = require("../internal/Util.js");
var _Const = require("../internal/util/Const.js");
var _RNCNaverMapGroundNativeComponent = _interopRequireDefault(require("../spec/RNCNaverMapGroundNativeComponent"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const NaverMapGroundOverlay = ({
  zIndex = 0,
  globalZIndex = _Const.Const.NULL_NUMBER,
  isHidden,
  minZoom = _Const.Const.MIN_ZOOM,
  maxZoom = _Const.Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  image,
  region,
  onTap
}) => {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RNCNaverMapGroundNativeComponent.default, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    region: region,
    image: (0, _Util.convertJsImagePropToNativeProp)(image),
    onTapOverlay: onTap
  });
};
exports.NaverMapGroundOverlay = NaverMapGroundOverlay;
//# sourceMappingURL=NaverMapGroundOverlay.js.map