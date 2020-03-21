const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mustache = require('mustache')
mustache.escape = (t) => t

const RULES = {
    fr: [
        /\s[.,]/,
        /[.,]\S/,
        /\S[?;:!]/,
        /[?;:!]\S/,
    ]
}

class Punctuation {
    constructor(language) {
        this.template = fs.readFileSync(path.resolve(__dirname, 'punctuation.mustache')).toString()
        this.badPunctuation = {}
        this.rules = RULES[language]
    }

    clear(target) {
        return target
        .replace(/https?:\/\/(\w+.\w+.\w+)/g, '')
        .replace(/\s?geocaching\.com/ig, '')
        .replace(/twitter.com/g, 'twitter')
        .replace(/cach\.ly/ig, '')
        .replace(/(\w+\.)me/g, '$1')
        .replace(/\s\.(loc|txt|gpx|png)/g, '')
        .replace(/(\S)\.\.\.(\s?)/g, '$1.$2')
        .replace(/A\.P\.E\./g, 'APE')
        .replace(/^@@.*/, '')
    }

    add(source, target) {
        if (!this.rules) return
        for(const rule of this.rules) {
            const m = this.clear(target).match(rule)
            if (m) {
                this.badPunctuation[target] =  m.input.length < 20 ? m.input : m.input.substr(m.index - 10, 20)
            }
        }
    }

    toJSON() {
        return {
            total: this.badPunctuation.size,
            badPunctuation: _.entries(this.badPunctuation).map(([target, extr]) => ({target: target.replace(/\n/g, '\\n'), extr}))
        }
    }

    toString() {
        return mustache.render(this.template, this.toJSON())
    }
}

module.exports = Punctuation