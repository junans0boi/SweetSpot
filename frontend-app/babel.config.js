module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ✨ 아래 플러그인 라인을 추가합니다.
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
      }]
    ]
  };
};
