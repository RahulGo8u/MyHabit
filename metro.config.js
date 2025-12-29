const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Resolver that automatically handles missing .js extensions
const defaultResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle relative requires (./ or ../)
  if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
    const originPath = context.originModulePath;
    if (originPath) {
      const dir = path.dirname(originPath);
      const fullPath = path.resolve(dir, moduleName);
      
      // If no extension, try adding .js
      if (!path.extname(moduleName)) {
        const withJs = fullPath + '.js';
        if (fs.existsSync(withJs) && fs.statSync(withJs).isFile()) {
          // File exists with .js extension - resolve it
          const moduleWithJs = moduleName + '.js';
          try {
            if (defaultResolver) {
              return defaultResolver(context, moduleWithJs, platform);
            }
          } catch (e) {
            // Return file directly if default resolver fails
            return {
              type: 'sourceFile',
              filePath: withJs,
            };
          }
        }
      }
      
      // If has .js extension, check if file exists
      if (moduleName.endsWith('.js')) {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          try {
            if (defaultResolver) {
              return defaultResolver(context, moduleName, platform);
            }
          } catch (e) {
            return {
              type: 'sourceFile',
              filePath: fullPath,
            };
          }
        }
      }
    }
  }
  
  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
