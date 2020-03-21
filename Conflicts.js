const fs = require('fs')
const path = require('path')
const ExtendedSet = require('./ExtendedSet')
const _ = require('lodash')
const mustache = require('mustache')
mustache.escape = (t) => t

class Conflicts {
    constructor() {
        this.sources = {}
        this.conflicts = {}
        this.template = fs.readFileSync(path.resolve(__dirname, 'conflicts.mustache')).toString()
    }

    add(sourceOrig, targetOrig) {
        const source = sourceOrig.toLowerCase()
        const target = targetOrig.toLowerCase()
        if (!this.sources[source]) {
            this.sources[source] = new ExtendedSet()
        }
        this.sources[source].add(target)

        if (this.sources[source].size > 1) this.conflicts[source] = this.sources[source]
    }

    toJSON() {
        return {
            total: _.keys(this.conflicts).length,
            conflicts: _.entries(this.conflicts).map(([source, targets]) => ({source,targets: targets.toJSON()}))
        }
    }

    toString() {
        return mustache.render(this.template, this.toJSON())
    }
}

module.exports = Conflicts