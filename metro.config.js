const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Ensure assetExts exists before modifying it
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts || [];
defaultConfig.resolver.assetExts.push("cjs");

module.exports = defaultConfig;
