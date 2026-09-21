const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Execute the actual TypeScript modules with only their external services replaced.
function load(file, mocks, env = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", "process", "console", outputText)(
    (name) => name in mocks ? mocks[name] : require(name), module, module.exports,
    { env }, { warn() {}, error() {} },
  );
  return module.exports;
}

function fixture({ completed = false, listTitle = "To Do", subscriptions = ["device"], statuses = {}, locked = false } = {}) {
  const updates = [], deleted = [], pushes = [];
  let busy = locked;
  const reminder = {
    id: "reminder", remindAt: new Date(0), sentAt: null, cancelledAt: null,
    task: { id: "task", title: "Test", completed, dueDate: new Date(0), list: { title: listTitle, board: { userId: "owner" } } },
  };
  const tx = {
    $queryRaw: async () => {
      if (busy || reminder.sentAt || reminder.cancelledAt) return [];
      busy = true;
      return [{ id: reminder.id }];
    },
    taskReminder: {
      findUnique: async () => reminder,
      update: async ({ data }) => { updates.push(data); Object.assign(reminder, data); },
    },
    pushSubscription: {
      findMany: async ({ where }) => {
        assert.equal(where.userId, "owner");
        return subscriptions.map((id) => ({ id, endpoint: id, p256dh: "key", auth: "auth" }));
      },
      deleteMany: async ({ where }) => { deleted.push(where.id); },
    },
  };
  const prisma = {
    taskReminder: { findMany: async () => [{ id: "reminder" }] },
    $transaction: async (fn) => {
      const wasBusy = busy;
      try { return await fn(tx); } finally { if (!wasBusy) busy = false; }
    },
  };
  const webPush = {
    setVapidDetails() {},
    async sendNotification(subscription) {
      pushes.push(subscription.endpoint);
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (statuses[subscription.endpoint]) throw { statusCode: statuses[subscription.endpoint] };
    },
  };
  const env = { WEB_PUSH_PUBLIC_KEY: "public", WEB_PUSH_PRIVATE_KEY: "private", WEB_PUSH_EMAIL: "mailto:test@example.com", NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: "public" };
  const { sendDueReminders } = load("lib/reminders.ts", { "@/lib/prisma": { prisma }, "web-push": webPush }, env);
  return { sendDueReminders, updates, deleted, pushes, env };
}

test("successful delivery marks a reminder sent once", async () => {
  const f = fixture();
  assert.equal((await f.sendDueReminders()).sentCount, 1);
  assert.ok(f.updates[0].sentAt instanceof Date);
  assert.equal((await f.sendDueReminders()).sentCount, 0);
  assert.equal(f.pushes.length, 1);
});

for (const status of [429, 500, 503]) {
  test(`HTTP ${status} preserves subscription and reminder for retry`, async () => {
    const f = fixture({ statuses: { device: status } });
    const result = await f.sendDueReminders();
    assert.equal(result.sentCount, 0);
    assert.equal(result.pendingCount, 1);
    assert.equal(f.updates.length, 0);
    assert.equal(f.deleted.length, 0);
  });
}

for (const status of [404, 410]) {
  test(`HTTP ${status} removes only the expired subscription`, async () => {
    const f = fixture({ statuses: { device: status } });
    assert.equal((await f.sendDueReminders()).pendingCount, 1);
    assert.deepEqual(f.deleted, ["device"]);
    assert.equal(f.updates.length, 0);
  });
}

test("no subscribed devices keeps the reminder pending", async () => {
  const f = fixture({ subscriptions: [] });
  assert.equal((await f.sendDueReminders()).pendingCount, 1);
  assert.equal(f.updates.length, 0);
});

for (const options of [{ completed: true }, { listTitle: "Done" }]) {
  test(`completed task is cancelled: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    assert.equal((await f.sendDueReminders()).cancelledCount, 1);
    assert.equal(f.pushes.length, 0);
    assert.ok(f.updates[0].cancelledAt);
  });
}

test("one successful device is sufficient, transient failure retains other device", async () => {
  const f = fixture({ subscriptions: ["a", "b"], statuses: { b: 503 } });
  assert.equal((await f.sendDueReminders()).sentCount, 1);
  assert.equal(f.deleted.length, 0);
});

test("overlapping invocations do not send the locked reminder twice", async () => {
  const f = fixture();
  const results = await Promise.all([f.sendDueReminders(), f.sendDueReminders()]);
  assert.equal(results.reduce((sum, r) => sum + r.sentCount, 0), 1);
  assert.equal(f.pushes.length, 1);
});

test("mismatched push keys fail before delivery", async () => {
  const f = fixture();
  f.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY = "different";
  await assert.rejects(f.sendDueReminders, /configuration/);
  assert.equal(f.pushes.length, 0);
});

test("scheduler requires its secret and never dispatches unauthorized requests", async () => {
  let calls = 0;
  const env = {};
  const { GET } = load("app/api/reminders/route.ts", {
    "@/lib/reminders": { sendDueReminders: async () => { calls++; return { sentCount: 0 }; } },
  }, env);
  assert.equal((await GET(new Request("http://localhost/api/reminders"))).status, 503);
  env.CRON_SECRET = "test-secret";
  for (const token of ["", "Bearer wrong", "Bearer test-secrex"]) {
    assert.equal((await GET(new Request("http://localhost/api/reminders", { headers: { authorization: token } }))).status, 401);
  }
  assert.equal(calls, 0);
  assert.equal((await GET(new Request("http://localhost/api/reminders", { headers: { authorization: "Bearer test-secret" } }))).status, 200);
  assert.equal(calls, 1);
});

function editFixture() {
  let update;
  const current = {
    dueDate: new Date("2026-10-01T12:00:00Z"), completed: false,
    list: { id: "list", title: "To Do" },
    reminders: [{ remindAt: new Date("2026-10-01T11:50:00Z") }],
  };
  const prisma = {
    task: { findUnique: async () => current, update: async (input) => { update = input; return input.data; } },
    list: { findFirst: async () => ({ id: "done", title: "Done" }) },
  };
  const { PATCH } = load("app/api/tasks/[id]/route.ts", {
    "@/lib/prisma": { prisma }, "@/lib/auth-utils": { getAuthUserId: async () => "owner" },
  });
  return { current, getUpdate: () => update, patch: (body) => PATCH(new Request("http://localhost/api/tasks/task", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }), { params: Promise.resolve({ id: "task" }) }) };
}

test("editing only the due date preserves the reminder offset", async () => {
  const f = editFixture();
  assert.equal((await f.patch({ dueDate: "2026-10-02T12:00:00Z" })).status, 200);
  assert.equal(f.getUpdate().data.reminders.create.remindAt.toISOString(), "2026-10-02T11:50:00.000Z");
});

for (const body of [{ dueDate: null }, { reminderMinutesBefore: null }, { completed: true }, { listId: "done" }]) {
  test(`editing task removes pending reminder: ${JSON.stringify(body)}`, async () => {
    const f = editFixture();
    assert.equal((await f.patch(body)).status, 200);
    assert.deepEqual(f.getUpdate().data.reminders, { deleteMany: { sentAt: null } });
  });
}

test("subscription status is scoped to the signed-in user", async () => {
  const { GET } = load("app/api/push-subscriptions/route.ts", {
    "@/lib/auth-utils": { getAuthUserId: async () => "owner" },
    "@/lib/prisma": { prisma: { pushSubscription: {
      findMany: async ({ where, select }) => {
        assert.deepEqual(where, { userId: "owner" });
        assert.deepEqual(select, { endpoint: true });
        return [{ endpoint: "https://push.example/device" }];
      },
    } } },
  });
  assert.deepEqual(await (await GET()).json(), { endpoints: ["https://push.example/device"] });
});

test("invalid subscriptions are rejected before database writes", async () => {
  const { POST } = load("app/api/push-subscriptions/route.ts", {
    "@/lib/auth-utils": { getAuthUserId: async () => "owner" },
    "@/lib/prisma": { prisma: { pushSubscription: { upsert: () => assert.fail("Must not save") } } },
  });
  for (const subscription of [null, {}, { endpoint: "http://example.com", keys: { p256dh: "a", auth: "b" } }]) {
    assert.equal((await POST(new Request("http://localhost/api/push-subscriptions", {
      method: "POST", body: JSON.stringify({ subscription }),
    }))).status, 400);
  }
});

test("notification click focuses the existing app instead of opening another tab", async () => {
  const handlers = {};
  let focused = false, closed = false, work;
  const self = { location: { origin: "https://kanban.example" }, addEventListener: (event, fn) => { handlers[event] = fn; } };
  const clients = {
    matchAll: async () => [{ url: "https://kanban.example/", focus: () => { focused = true; } }],
    openWindow: () => assert.fail("Existing window should be focused"),
  };
  new Function("self", "clients", fs.readFileSync("public/sw.js", "utf8"))(self, clients);
  handlers.notificationclick({ notification: { close: () => { closed = true; } }, waitUntil: (promise) => { work = promise; } });
  await work;
  assert.ok(closed && focused);
});
