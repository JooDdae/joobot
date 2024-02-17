const headers = { "Content-Type": "application/json" };

module.exports = async (bojId) => {
    const url = `https://solved.ac/api/v3/user/show?handle=${encodeURIComponent(bojId)}`;
    const response = await fetch(url, { headers }).then((res) => res.json());
    return response.bio;
}