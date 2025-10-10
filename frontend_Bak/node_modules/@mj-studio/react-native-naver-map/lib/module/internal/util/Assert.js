"use strict";

class NaverMapJSError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NaverMapJSError';
  }
}
export function nAssert(condition, message) {
  if (!condition) {
    throw new NaverMapJSError(message);
  }
}
//# sourceMappingURL=Assert.js.map