const calculateCii = (volume, distance) => {
    return (volume * 3.114) / (distance * 192)
}

module.exports = { calculateCii }