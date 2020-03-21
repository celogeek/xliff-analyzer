const fs = require('fs')
const path = require('path')
const ExtendedSet = require('./ExtendedSet')
const _ = require('lodash')
const mustache = require('mustache')
mustache.escape = (t) => t

class SameTranslation {
    constructor() {
        this.sameTranslation = new ExtendedSet()
        this.template = fs.readFileSync(path.resolve(__dirname, 'sameTranslation.mustache')).toString()
    }
    add(source, target) {
        if (source === target) this.sameTranslation.add(source)
    }
    toJSON() {
        return {
            total: this.sameTranslation.size,
            sameTranslation: this.sameTranslation.toJSON().sort()
        }
    }

    toString() {
        return mustache.render(this.template, this.toJSON())
    }
}

module.exports = SameTranslation