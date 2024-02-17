const ID = /^[0-9a-z_]{3,20}$/;
const headers = { "Content-Type": "application/json" };

module.exports = async (bojId) => {
    if (!ID.test(bojId)) return false;
    const url = `https://solved.ac/api/v3/user/show?handle=${encodeURIComponent(bojId)}`;
    const response = await fetch(url, { headers });
    return response.status === 200;
}