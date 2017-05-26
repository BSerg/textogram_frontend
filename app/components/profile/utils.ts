export function displayNumber(n: number) {
    if (!n && n != 0) {
        return '0'
    }
    else if (n < 1000) {
        return n.toString();
    }

    else if (n >= 1000 && n < 1000000) {
        return (Math.round(n / 100) / 10).toString() + 'K';
    }
    else if (n >= 1000000) {
        return (Math.round(n / 100000) / 10).toString() + 'M';
    }
}