const parseExpiry = (expiry: string): number => {
    const timeUnits: { [key: string]: number } = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    let total = 0;
    const times = expiry.split(" ");

    for (const time of times) {
        const match = time.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            if (timeUnits[unit]) {
                total += value * timeUnits[unit];
            }
        }
    }

    if (total === 0) throw new Error("Invalid expiry format");

    return total;
};

export { parseExpiry };
