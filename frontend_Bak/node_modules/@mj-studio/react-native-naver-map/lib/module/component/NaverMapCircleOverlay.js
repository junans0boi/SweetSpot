"use strict";

import React from 'react';
import { processColor } from 'react-native';
import { Const } from "../internal/util/Const.js";
import { default as NativeNaverMapCircle } from '../spec/RNCNaverMapCircleNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
export const NaverMapCircleOverlay = ({
  latitude,
  longitude,
  zIndex = 0,
  globalZIndex = Const.NULL_NUMBER,
  isHidden,
  minZoom = Const.MIN_ZOOM,
  maxZoom = Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  radius = 0,
  color = 'black',
  outlineWidth = 0,
  outlineColor = 'black',
  onTap
}) => {
  return /*#__PURE__*/_jsx(NativeNaverMapCircle, {
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
    radius: radius,
    color: processColor(color),
    outlineWidth: outlineWidth,
    outlineColor: processColor(outlineColor),
    onTapOverlay: onTap
  });
};
//# sourceMappingURL=NaverMapCircleOverlay.js.map