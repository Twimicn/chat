const CATCH_VER = 'v33';
self.addEventListener('install', function (event) {
    let languages = ['zh-cn', 'en-us'];
    let languageCode = (navigator.language || 'zh-cn').toLocaleLowerCase();
    if (languages.indexOf(languageCode) === -1) languageCode = 'zh-cn';
    let baseDir = '/';
    if (location.href.indexOf('/chat/') !== -1) {
        baseDir = '/chat/';
    } else if (location.href.indexOf('/TwimiChat/') !== -1) {
        baseDir = '/TwimiChat/';
    }
    event.waitUntil(
        caches.open(CATCH_VER).then(function (cache) {
            return cache.addAll([
                baseDir,
                baseDir + 'index.html',
                baseDir + 'favicon.ico',
                baseDir + 'lang/' + languageCode + '.json',
                'https://bunnies.cc/BunnyDialog/dialog.js',
            ]);
        })
    );
});
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (names) {
        return Promise.all(names.map(function (name) {
            if (name !== CATCH_VER) {
                return caches.delete(name);
            }
        }))
    }));
});
self.addEventListener('fetch', function (event) {
    if (!event.request.url.startsWith(location.origin)) {
        return;
    }
    event.respondWith(caches.match(event.request).then(function (response) {
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                let responseClone = response.clone();
                caches.open(CATCH_VER).then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                return new Response('[]');
            });
        }
    }));
});
