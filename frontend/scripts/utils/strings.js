function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}