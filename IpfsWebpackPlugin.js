const path = require('path')
const gulp = require('gulp')
const processIpfs = require('gulp-ipfs')
const cache = require('gulp-cached')
const through = require('through2')

const emptyHook = (async () => {})
class IpfsWebpackPlugin {

	constructor(config, cb) {
		this.config = config
		this.config.name = config.name || ""
		this.processIpfs = processIpfs(config)

		const upperCaseAlias = this.config.name ? this.config.name[0].toUpperCase() + this.config.name.slice(1) : ""
		this.promiseResultAlias = 'Ipfs' + upperCaseAlias + 'WebpackPlugin'
		this.promise = new Promise(((resolve) => {
			this.resolve = resolve
		}).bind(this))
	}

	apply(compiler) {
		const self = this

		compiler.hooks.afterEmit.tapPromise('IpfsWebpackPlugin', function(compilation) {
			//Better to use output directory since not all assets may be in chunk
			let hash = ""
			return new Promise((resolve) => gulp.src(path.join(compilation.outputOptions.path, "/**/*"))
				.pipe(cache(self.config.name))
				.pipe(self.processIpfs())
				.pipe(through.obj((publishedHash, enc, done) => {
					hash = publishedHash
					done()
				})).on('finish', () => {
					self.resolve(hash)
					resolve(hash)
				}))
		})
	}
}

module.exports = IpfsWebpackPlugin