function parse(messages) {
    let res = "";
    for (let i = 0; i < messages.length; i++) {
        if (i != messages.length - 1) {
            res += messages[i] + ", ";
        } else {
            res += messages[i];
        }
    }
    return res;
}

module.exports = {
    parse,
};