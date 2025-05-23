function sfc32(a, b, c, d) {
    return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

const seedgen = () => (3) >>> 0;
var getRand = sfc32(seedgen(), seedgen(), seedgen(), seedgen());

function reSeedRNG(n1, n2, n3, n4) {
    getRand = sfc32(n1, n2, n3, n4)
}