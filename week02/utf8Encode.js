function encodeUTF(text) {
    const code = encodeURIComponent(text);
    const res = [];
    for (let i = 0; i < code.length; i++) {
        const c = code.charAt(i);
        if (c === '%') {
            res.push(parseInt(code.charAt(i + 1) + code.charAt(i + 2), 16));
            i += 2;
        } else {
            res.push(c.charCodeAt(0));
        }
    }
    return res;
}
