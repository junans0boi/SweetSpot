"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cameraChangeReasonFromNumber = cameraChangeReasonFromNumber;
exports.cameraEasingToNumber = cameraEasingToNumber;
exports.convertJsImagePropToNativeProp = void 0;
exports.createCameraInstance = createCameraInstance;
exports.getAlignIntValue = getAlignIntValue;
var _reactNative = require("react-native");
var _Const = require("./util/Const.js");
function cameraEasingToNumber(value = 'EaseIn') {
  switch (value) {
    case 'None':
      return 1;
    case 'Linear':
      return 2;
    case 'Fly':
      return 3;
    case 'EaseOut':
      return 4;
    default:
    case 'EaseIn':
      return 0;
  }
}
function cameraChangeReasonFromNumber(value) {
  switch (value) {
    case 0:
      return 'Developer';
    case 1:
      return 'Gesture';
    case 2:
      return 'Control';
    case 3:
      return 'Location';
    default:
      return 'Developer';
  }
}
function getAlignIntValue(value) {
  switch (value) {
    case 'Center':
      return 0;
    case 'Left':
      return 1;
    case 'Right':
      return 2;
    case 'Top':
      return 3;
    case 'TopLeft':
      return 5;
    case 'TopRight':
      return 6;
    case 'BottomRight':
      return 7;
    case 'BottomLeft':
      return 8;
    default:
    case 'Bottom':
      return 4;
  }
}
function createCameraInstance({
  bearing,
  latitude,
  longitude,
  tilt,
  zoom
}) {
  return {
    latitude,
    longitude,
    zoom: zoom ?? _Const.Const.DEFAULT_ZOOM,
    tilt: tilt ?? _Const.Const.DEFAULT_TILT,
    bearing: bearing ?? _Const.Const.DEFAULT_BEARING
  };
}
const convertJsImagePropToNativeProp = image => {
  if (typeof image === 'number') {
    const rnAssetUri = _reactNative.Image.resolveAssetSource(image)?.uri;
    if (rnAssetUri) {
      return {
        rnAssetUri
      };
    } else {
      return;
    }
  }
  const {
    assetName,
    httpUri,
    reuseIdentifier,
    symbol
  } = image;
  if (assetName) {
    return {
      assetName,
      reuseIdentifier
    };
  }
  if (httpUri) {
    return {
      httpUri,
      reuseIdentifier
    };
  }
  if (symbol) {
    return {
      symbol,
      reuseIdentifier
    };
  }
  return;
};
exports.convertJsImagePropToNativeProp = convertJsImagePropToNativeProp;
//# sourceMappingURL=Util.js.map