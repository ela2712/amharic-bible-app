const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Pack the Bible as a raw asset so Hermes does not parse 5.5MB of JSON as JS.
config.resolver.assetExts.push('txt');

module.exports = config;
