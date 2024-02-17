function numberToRoman(num) {
    if (typeof num !== 'number') throw new Error('Input must be a number');
    if (num < 1) throw new Error('Input must be a positive number');

    const roman = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };

    let result = '';

    for (let key in roman) {
        const value = roman[key];
        result += key.repeat(Math.floor(num / value));
        num = num % value;
    }

    return result;
}

module.exports = (tier) => {
    if (typeof tier !== 'number') throw new Error('Input must be a number');
    if (tier < 0) throw new Error('Input must be a non-negative number');
    if (tier > 30) throw new Error('Input must be a number less than or equal to 30');

    if (tier === 0) return 'Unranked';
    if (tier <= 5) return `Bronze ${numberToRoman(5-(tier-1)%5)}`;
    if (tier <= 10) return `Silver ${numberToRoman(5-(tier-6)%5)}`;
    if (tier <= 15) return `Gold ${numberToRoman(5-(tier-11)%5)}`;
    if (tier <= 20) return `Platinum ${numberToRoman(5-(tier-16)%5)}`;
    if (tier <= 25) return `Diamond ${numberToRoman(5-(tier-21)%5)}`;
    if (tier <= 30) return `Ruby ${numberToRoman(5-(tier-26)%5)}`;
}