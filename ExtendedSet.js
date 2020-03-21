class ExtendedSet extends Set {
    map(cb) {
        return [...this].map(cb)
    }
    toJSON() {
        return [...this]
    }
}

module.exports = ExtendedSet