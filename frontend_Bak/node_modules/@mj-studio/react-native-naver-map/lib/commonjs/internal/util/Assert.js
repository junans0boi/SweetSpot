"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nAssert = nAssert;
class NaverMapJSError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NaverMapJSError';
  }
}
function nAssert(condition, message) {
  if (!condition) {
    throw new NaverMapJSError(message);
  }
}
//# sourceMappingURL=Assert.js.map