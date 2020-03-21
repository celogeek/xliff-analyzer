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
        .replace(/\s\.(loc|txt|gpx|png)/g, '')
        .replace(/\.(com|ly)([\s.,])?/,'$2')
        .replace(/(\S)\.\.\.(\s?)/g, '$1.$2')
    }

    add(source, target) {
        if (!this.rules) return
        if (source === target) return
        if (this.badPunctuation[target]) return
        for(const rule of this.rules) {
            for(const m of  this.clear(target).matchAll(rule)) {
                if (!this.badPunctuation[target]) this.badPunctuation[target] = []
                this.badPunctuation[target].push(m.input.length < 20 ? m.input : m.input.substr(m.index - 10, 20))
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