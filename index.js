const xliff2js = require('xliff/xliff12ToJs');
const fs = require('fs')
const _ = require('lodash')
const Conflicts = require('./Conflicts')
const SameTranslation = require('./SameTranslation')
const Punctuation = require('./Punctuation')

function extract(js, klass) {
    for(const resource of _.values(js.resources)) {
        for(const {source, target} of _.values(resource)) {
            klass.add(source, target)
        }
    }
    console.log(klass.toString())
}

async function run(file) {
    if (!file) return
    const xliff = fs.readFileSync(file).toString()
    const js = xliff2js(xliff)
    extract(js, new Conflicts())
    extract(js, new SameTranslation())
    extract(js, new Punctuation(js.targetLanguage))
}

run(...process.argv.splice(2))