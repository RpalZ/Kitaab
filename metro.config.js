// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultconfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetsExts.push('cjs');


module.exports = defaultconfig;
