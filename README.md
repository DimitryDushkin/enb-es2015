Basic ENB tech for transpiling ES2015 JS to ES5 for most browser support.
Includes transpile techs that do not add any runtime.

Features:
 * Converts only project files.
 * Exclude files in `./libs` and `./*.blocks/libs/` folders.
 * ES2015 only plugins

### Example
```javascript
// .enb/make.js
//
nodeConfig.addTechs([
    // ...
    // Gather and transpile all *.vanilla.js, *.js, *.browser.js files (by default)
    // to single "<bundleName>/<bundleName>.js" file
    [require('enb-es2015/techs/es2015'), {
        target: '?.js'
    }],
    // ...
]);
```

Thanks to [@tenorok](https://github.com/tenorok) for initial code of tech.

TODO:
 * Configuable babel plugins set;
 * Working sourcemaps.
