"use strict";

import React, { useMemo } from 'react';
import { processColor } from 'react-native';
import { convertJsImagePropToNativeProp } from "../internal/Util.js";
import { nAssert } from "../internal/util/Assert.js";
import { Const } from "../internal/util/Const.js";
import { default as NativeNaverMapMultiPath } from '../spec/RNCNaverMapMultiPathNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
export const NaverMapMultiPathOverlay = ({
  pathParts,
  globalZIndex = Const.NULL_NUMBER,
  isHidden,
  isHideCollidedCaptions,
  isHideCollidedMarkers,
  isHideCollidedSymbols,
  isMaxZoomInclusive,
  isMinZoomInclusive,
  maxZoom = Const.MAX_ZOOM,
  minZoom = Const.MIN_ZOOM,
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
    nAssert(pathPart.coords.length >= 2, `[NaverMapMultiPathOverlay] pathParts[${index}].coords length should be equal or greater than 2, is ${pathPart.coords.length}.`);
  });
  if (pathParts.some(pathPart => pathPart.coords.length < 2)) return null;

  // Process pathParts to native format with useMemo
  const processedPathParts = useMemo(() => {
    return pathParts.map(pathPart => ({
      coords: pathPart.coords,
      color: processColor(pathPart.color || 'black'),
      passedColor: processColor(pathPart.passedColor || 'black'),
      outlineColor: processColor(pathPart.outlineColor || 'black'),
      passedOutlineColor: processColor(pathPart.passedOutlineColor || 'black')
    }));
  }, [pathParts]);
  return /*#__PURE__*/_jsx(NativeNaverMapMultiPath, {
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
    patternImage: patternImage ? convertJsImagePropToNativeProp(patternImage) : undefined,
    patternInterval: patternInterval,
    progress: progress,
    outlineWidth: outlineWidth,
    onTapOverlay: onTap
  });
};
//# sourceMappingURL=NaverMapMultiPathOverlay.js.map