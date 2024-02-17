module.exports = (time) => {
    if (typeof time !== 'number') throw new Error('Input must be a number');
    
    const prefix = time < 0 ? '-' : '';
    time = Math.abs(time);

    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    if (hours === 0 && minutes === 0) return prefix + `${seconds}초`;
    if (hours === 0) return prefix + `${minutes}분 ${seconds}초`;
    return prefix + `${hours}시간 ${minutes}분 ${seconds}초`;
}