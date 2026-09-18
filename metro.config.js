const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Keep .json as JS source for libraries. Pack the Bible as a raw asset so Hermes
// does not have to parse a 5.5MB object literal on startup (that freezes Expo Go).
config.resolver.assetExts.push('biblejson');

module.exports = config;
