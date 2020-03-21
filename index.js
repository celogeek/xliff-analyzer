const xliff2js = require('xliff/xliff12ToJs');
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mustache = require('mustache')
mustache.escape = (t) => t

class ExtendedSet extends Set {
    map(cb) {
        return [...this].map(cb)
    }
    toJSON() {
        return [...this]
    }
}

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
            total: _.keys(this.conflicts).length,
            sameTranslation: this.sameTranslation.toJSON().sort()
        }
    }

    toString() {
        return mustache.render(this.template, this.toJSON())
    }
}


function extractConflicts(js) {
    const conflicts = new Conflicts()

    for(const resource of _.values(js.resources)) {
        for(const {source, target} of _.values(resource)) {
            conflicts.add(source, target)
        }
    }
    console.log(conflicts.toString())
}

function extractSameTranslation(js) {
    const sameTranslation = new SameTranslation()
    for(const resource of _.values(js.resources)) {
        for(const {source, target} of _.values(resource)) {
            sameTranslation.add(source, target)
        }
    }
    console.log(sameTranslation.toString())
}

async function run(file) {
    if (!file) return
    const xliff = fs.readFileSync(file).toString()
    const js = xliff2js(xliff)
    extractConflicts(js)
    extractSameTranslation(js)
}

run(...process.argv.splice(2))