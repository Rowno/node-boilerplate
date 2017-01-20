'use strict'
const Github = require('github')
const Generator = require('yeoman-generator')

const github = new Github()

function githubUserInfo(username) {
  return github.users.getForUser({
    username
  }).catch(err => {
    throw new Error(`Could not fetch your GitHub profile. Make sure you typed it correctly.\n\n${err.message}`)
  })
}

module.exports = class extends Generator {
  initializing() {
    const now = new Date()
    this.data = {
      appname: this.appname,
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }
  }

  prompting() {
    return this.prompt([{
      type: 'input',
      name: 'username',
      message: `What's your GitHub username?`,
      store: true
    }]).then(props => {
      return githubUserInfo(props.username)
    }).then(user => {
      this.data.githubUser = user.login
      this.data.realname = user.name
      this.data.website = user.blog || user.html_url
    })
  }

  writing() {
    [
      'lib/index.js',
      'lib/index.test.js',
      '.editorconfig',
      '.gitattributes',
      '.gitignore',
      '.npmignore',
      '.travis.yml',
      'CHANGELOG.md',
      'LICENSE',
      'package.json',
      'README.md'
    ].forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        this.data
      )
    })
  }

  install() {
    this.yarnInstall(['ava', 'xo'], {dev: true})
  }
}
