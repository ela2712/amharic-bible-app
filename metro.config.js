const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'txt');
config.resolver.assetExts = [...new Set([...config.resolver.assetExts, 'txt'])];

module.exports = config;
