function calculateDistance(lat1, lon1, lat2, lon2) {
    const r = 3959;
    const p = Math.PI / 180;

    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))) / 2;

    return 2 * r * Math.asin(Math.sqrt(a));
}

module.exports = { calculateDistance }