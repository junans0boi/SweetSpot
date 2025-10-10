"use strict";

import React from 'react';
import { processColor } from 'react-native';
import { nAssert } from "../internal/util/Assert.js";
import { Const } from "../internal/util/Const.js";
import { default as NativeNaverMapArrowheadPath } from '../spec/RNCNaverMapArrowheadPathNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
export const NaverMapArrowheadPathOverlay = ({
  zIndex = 0,
  globalZIndex = Const.NULL_NUMBER,
  isHidden,
  minZoom = Const.MIN_ZOOM,
  maxZoom = Const.MAX_ZOOM,
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
    nAssert(coords.length >= 2, `[NaverMapArrowheadPathOverlay] coords length should be equal or greater than 2, is ${coords.length}.`);
    if (coords.length < 2) return null;
  }
  return /*#__PURE__*/_jsx(NativeNaverMapArrowheadPath, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    coords: coords,
    width: width,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    color: processColor(color),
    outlineColor: processColor(outlineColor),
    outlineWidth: outlineWidth,
    headSizeRatio: headSizeRatio,
    onTapOverlay: onTap
  });
};
//# sourceMappingURL=NaverMapArrowheadPathOverlay.js.map