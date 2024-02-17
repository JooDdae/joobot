const headers = { "Content-Type": "application/json" };

module.exports = async (query = "", count = 1) => {
    const url = `https://solved.ac/api/v3/search/problem?query=${encodeURIComponent(query)}&sort=random`;
    const response = await fetch(url, { headers }).then((res) => res.json());
    return response.items.slice(0, count);
}