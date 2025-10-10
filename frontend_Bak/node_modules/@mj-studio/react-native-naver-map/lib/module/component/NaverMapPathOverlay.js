"use strict";

import React from 'react';
import { processColor } from 'react-native';
import { convertJsImagePropToNativeProp } from "../internal/Util.js";
import { nAssert } from "../internal/util/Assert.js";
import { Const } from "../internal/util/Const.js";
import { default as NativeNaverMapPath } from '../spec/RNCNaverMapPathNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
export const NaverMapPathOverlay = ({
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
  isHideCollidedCaptions,
  isHideCollidedMarkers,
  isHideCollidedSymbols,
  outlineColor = 'black',
  outlineWidth = 0,
  passedColor = 'black',
  passedOutlineColor = 'black',
  patternImage,
  patternInterval = 0,
  progress = 0,
  onTap
}) => {
  if (coords) {
    nAssert(coords.length >= 2, `[NaverMapPolylineOverlay] coords length should be equal or greater than 2, is ${coords.length}.`);
    if (coords.length < 2) return null;
  }
  nAssert(progress >= -1 && progress <= 1, '[NaverMapPolylineOverlay] progress should be -1 ~ 1');
  return /*#__PURE__*/_jsx(NativeNaverMapPath, {
    zIndexValue: zIndex,
    globalZIndexValue: globalZIndex,
    isHidden: isHidden,
    minZoom: minZoom,
    maxZoom: maxZoom,
    coords: coords,
    width: width,
    isMinZoomInclusive: isMinZoomInclusive,
    isMaxZoomInclusive: isMaxZoomInclusive,
    isHideCollidedCaptions: isHideCollidedCaptions,
    isHideCollidedMarkers: isHideCollidedMarkers,
    isHideCollidedSymbols: isHideCollidedSymbols,
    color: processColor(color),
    passedColor: processColor(passedColor),
    passedOutlineColor: processColor(passedOutlineColor),
    outlineColor: processColor(outlineColor),
    patternImage: patternImage ? convertJsImagePropToNativeProp(patternImage) : undefined,
    patternInterval: patternInterval,
    outlineWidth: outlineWidth,
    progress: progress,
    onTapOverlay: onTap
  });
};
//# sourceMappingURL=NaverMapPathOverlay.js.map