exports.baseUrl = (isSecure=false) => {
    const url = process.env.HOST + ':' + process.env.PORT;
    return isSecure? 'https://' + url: 'http://' + url;
}