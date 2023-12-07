function doGet(pathname, request, response) {
    let answer = {};

    switch(pathname) {
        case '/ranking':
            const responseData = { "ranking": [{"nick":"jpleal","victories":2,"games":2},{"nick":"zp","victories":0,"games":2}] };
            const jsonContent = JSON.stringify(responseData);
    }
}