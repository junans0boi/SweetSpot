"use strict";

import hash from 'object-hash';
import React, { Children } from 'react';
import { processColor } from 'react-native';
import { convertJsImagePropToNativeProp, getAlignIntValue } from "../internal/Util.js";
import { nAssert } from "../internal/util/Assert.js";
import { Const } from "../internal/util/Const.js";
import { default as NativeNaverMapMarker } from '../spec/RNCNaverMapMarkerNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
const defaultCaptionProps = {
  text: '',
  textSize: 12,
  minZoom: Const.MIN_ZOOM,
  maxZoom: Const.MAX_ZOOM,
  color: 'black',
  haloColor: 'transparent',
  requestedWidth: 0
};
const defaultSubCaptionProps = {
  text: '',
  textSize: 10,
  minZoom: Const.MIN_ZOOM,
  maxZoom: Const.MAX_ZOOM,
  color: 'black',
  haloColor: 'transparent',
  requestedWidth: 0
};
export const NaverMapMarkerOverlay = ({
  latitude,
  longitude,
  zIndex = 0,
  globalZIndex = Const.NULL_NUMBER,
  isHidden,
  minZoom = Const.MIN_ZOOM,
  maxZoom = Const.MAX_ZOOM,
  isMinZoomInclusive,
  isMaxZoomInclusive,
  width = Const.NULL_NUMBER,
  height = Const.NULL_NUMBER,
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
  nAssert(Children.count(children) <= 1, `[NaverMapMarkerOverlay] children count should be equal or less than 1, is ${Children.count(children)}`);
  const _caption = (() => {
    const inner = {
      ...defaultCaptionProps,
      ...caption,
      align: getAlignIntValue(caption?.align),
      color: processColor(caption?.color ?? defaultCaptionProps.color),
      haloColor: processColor(caption?.haloColor ?? defaultCaptionProps.haloColor)
    };
    return {
      ...inner,
      key: hash(inner)
    };
  })();
  const _subCaption = (() => {
    const inner = {
      ...defaultSubCaptionProps,
      ...subCaption,
      color: processColor(subCaption?.color ?? defaultSubCaptionProps.color),
      haloColor: processColor(subCaption?.haloColor ?? defaultSubCaptionProps.haloColor)
    };
    return {
      ...inner,
      key: hash(inner)
    };
  })();
  return /*#__PURE__*/_jsx(NativeNaverMapMarker, {
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
    tintColor: processColor(tintColor),
    image: convertJsImagePropToNativeProp(image),
    onTapOverlay: onTap,
    caption: _caption,
    subCaption: _subCaption,
    children: children
  });
};
//# sourceMappingURL=NaverMapMarkerOverlay.js.map