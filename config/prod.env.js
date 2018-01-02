'use strict'

const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRev = new GitRevisionPlugin()

module.exports = {
	NODE_ENV: '"production"',
	GITVERSION: JSON.stringify(gitRev.version()),
	GITCOMMITHASH: JSON.stringify(gitRev.commithash()),
	GITBRANCH: JSON.stringify(gitRev.branch())
}
