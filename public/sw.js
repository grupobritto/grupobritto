// public/sw.js

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png', // Adapte para o caminho do seu logo
    badge: '/logo.png', // Adapte para o caminho do seu logo
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
