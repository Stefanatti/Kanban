# Task reminders

## Vercel Hobby deployment

Production site: https://kanban-yrs1.vercel.app/

Vercel Hobby cron jobs only run daily. Use an external scheduler such as
[cron-job.org](https://cron-job.org/en/) for the minute-by-minute request below.
The job must be created in your scheduler account; deploying this repository
alone does not activate automatic reminders.

1. Run `npm run reminders:check -- --init-secret` locally. This verifies the
   existing push key pair and generates a missing `CRON_SECRET` in `.env` without
   printing secrets. Do not regenerate working VAPID keys: existing browser
   subscriptions depend on them.
2. Set these variables in Vercel's **Production** environment:
   `WEB_PUSH_EMAIL` (a `mailto:` contact), `WEB_PUSH_PUBLIC_KEY`,
   `WEB_PUSH_PRIVATE_KEY`, `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, and `CRON_SECRET`.
   Both public keys must match. Copy values securely from `.env`.
3. Check the production database using `prisma migrate status`, and apply
   pending migrations with `prisma migrate deploy` using the production
   `DATABASE_URL`. Local migration status does not verify production.
4. Deploy/redeploy the application after setting variables. The browser public
   key is embedded at build time.
5. Create a cron-job.org job with these settings:

   | Setting | Value |
   | --- | --- |
   | URL | `https://kanban-yrs1.vercel.app/api/reminders` |
   | Method | `GET` |
   | Schedule | Every minute (`* * * * *`) |
   | Header name | `Authorization` |
   | Header value | `Bearer YOUR_CRON_SECRET` |

   Use the production domain, not a preview deployment. Enable the job after
   its test execution returns HTTP 200. The endpoint accepts the secret without
   a browser login; invalid secrets return 401, missing server configuration 503.

## Verification

- `npm run test:reminders`: delivery, failure, completion, concurrency, and auth regressions.
- `npm run reminders:check`: validates configuration without exposing values.
- `npm run build`: production compilation and type/lint checks.
- In a supported browser on the deployed HTTPS site, sign in, choose **Enable
  task reminders**, and create a task due a few minutes ahead with **At due time**.
- Confirm one notification arrives, including with the tab closed. The scheduler
  checks once per minute, so delivery is not guaranteed at the exact second.
- Confirm editing the due time reschedules it, disabling a reminder removes it,
  and moving a task to Done prevents delivery. Check scheduler history for 200s.

## Delivery behavior

Failed sends remain pending for a later run. Only expired subscriptions (404/410)
are removed. A reminder is marked sent when at least one subscribed device accepts
the push; failed devices are not retried after another device succeeds. Tasks with
no subscriptions remain pending. Completed tasks and tasks in a Done list are
cancelled. Deleting a task removes its reminders through the database relation.

Database row locks prevent simultaneous scheduler calls from sending the same
reminder. Delivery is not exactly-once: a process crash after a push but before the
database commit can cause a retry. The browser notification tag limits visible
duplicates. Each invocation considers at most 100 oldest pending reminders and
stops starting work after 40 seconds. This is intended for a small personal board;
a large backlog of undeliverable reminders needs a queued retry/backoff design.

References: [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing),
[cron-job.org scheduling](https://docs.cron-job.org/creating-cron-jobs.html).
