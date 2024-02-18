const headers = { "Content-Type": "application/json" };

module.exports = async (query = "", count = 1) => {
    try {
        const url = `https://solved.ac/api/v3/search/problem?query=${encodeURIComponent(query)}&sort=random`;
        const response = await fetch(url, { headers }).then((res) => res.json());   
        return response.items.slice(0, count);
    } catch (error) {
        console.error(`There was an error trying to get random problems: ${error}`);
        return [];
    }
}