// Partial copy of https://github.com/enb-make/enb-js/blob/master/techs/browser-js.js
var vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    File = require('enb-source-map/lib/file'),
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
                    file = new File(node.resolvePath(this._target), { sourceMap: false });

                for (var i = 0; i < sources.length; i++) {
                    file.writeLine('/* begin: ' + sources[i].relPath + ' */');

                    if (sources[i].relPath.indexOf('/libs/') !== -1) {
                        file.writeFileContent(sources[i].relPath, sources[i].contents);
                    } else {
                        file.writeFileContent(sources[i].relPath, babel.transform(sources[i].contents, babelOptions).code);
                    }

                    file.writeLine('/* end: ' + sources[i].relPath + ' */');
                }

                return file.getContent();
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
