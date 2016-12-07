// Partial copy of https://github.com/enb-make/enb-js/blob/master/techs/browser-js.js
var vow = require('vow'),
    enb = require('enb'),
    fs = require('fs'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    babel = require('babel-core'),
    babelOptions = {
        plugins: [
            'transform-es2015-arrow-functions',
            'transform-es2015-block-scoped-functions',
            'transform-es2015-function-name',
            'transform-es2015-block-scoping',
            'transform-es2015-destructuring',
            'transform-es2015-parameters',
            'transform-es2015-shorthand-properties',
            'transform-es2015-spread',
            'transform-es2015-template-literals'
        ],
        compact: false
    };

module.exports = buildFlow.create()
    .name('babel')
    .target('target', '?.browser.js')
    .useFileList(['vanilla.js', 'js', 'browser.js'])
    .builder(function(sourceFiles) {
        var promises = [this._readSourceFiles(sourceFiles)];

        return vow.all(promises)
            .spread(function(sources) {
                var node = this.node,
                    file = '';

                for (var i = 0; i < sources.length; i++) {
                    file  += '/* begin: ' + sources[i].relPath + ' */\n';

                    if (sources[i].relPath.indexOf('/libs/') !== -1) {
                        file += sources[i].contents;
                    } else {
                        file += babel.transform(sources[i].contents, babelOptions).code;
                    }

                    file += '/* end: ' + sources[i].relPath + ' */\n';
                }

                return file;
            }, this);
    })
    .methods({
        /**
         * Reads source js files.
         *
         * @protected
         * @param {FileList} files
         * @returns {FileData[]}
         */
        _readSourceFiles: function(files) {
            var node = this.node;

            return vow.all(files.map(function(file) {
                return vfs.read(file.fullname, 'utf8')
                    .then(function(contents) {
                        return {
                            path: file.fullname,
                            relPath: node.relativePath(file.fullname),
                            contents: contents
                        };
                    });
            }));
        }
    })
    .createTech();
