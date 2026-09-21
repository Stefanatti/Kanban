self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {
    title: "Kanban reminder",
    body: "You have a task reminder.",
  };

  const options = {
    body: payload.body || "You have a task reminder.",
    tag: payload.taskId || "kanban-reminder",
    data: payload,
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || "Kanban reminder",
      options,
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL("/", self.location.origin).href;
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }

        return clients.openWindow(url);
      }),
  );
});
