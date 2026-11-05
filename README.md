# Kanban

**Make your work visible and your next step clear.** Kanban is a full-stack task
management app for organizing work into boards, workflow columns, and actionable
tasks.

**[Try the live demo](https://kanban-yrs1.vercel.app/)**

Create an account, build a board around your workflow, and keep track of the
details that help work move forward—from subtasks and due dates to optional
browser reminders.

## What you can do

- **Organize work your way:** create and manage boards and workflow columns.
- **Keep tasks actionable:** add descriptions, subtasks, due dates, and completion
  states.
- **See progress at a glance:** move tasks between columns as work progresses.
- **Stay on top of deadlines:** optionally enable browser push reminders for
  upcoming tasks.
- **Keep your workspace personal:** sign up and sign in with an email and
  password.
- **Manage data reliably:** store boards and tasks in PostgreSQL, with Prisma
  handling the data model.

## Tech stack

- [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- TypeScript
- [Material UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) and RTK Query
- [Prisma](https://www.prisma.io/) with PostgreSQL
- [Auth.js](https://authjs.dev/) credentials authentication
- Web Push for optional task reminders

## Run locally

### Prerequisites

- Node.js and npm
- A PostgreSQL database

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Stefanatti/Kanban.git
   cd Kanban
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   AUTH_SECRET="your-generated-secret"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api/"
   ```

   Generate an Auth.js secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Replace the database URL with the connection string for your PostgreSQL
   database. Keep `.env.local` private; never commit secrets.

3. Generate the Prisma client and apply the included database migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and create an account.

## Task reminders

Browser push reminders are optional and require VAPID keys, server configuration,
and a scheduler that calls the reminders endpoint. They are not enabled by the
basic local setup. For configuration, deployment, and delivery details, see
[`docs/reminders.md`](docs/reminders.md).

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run test:reminders` | Run reminder delivery and authorization tests |
| `npm run reminders:check` | Check reminder configuration without printing secrets |

## Contributing

Ideas, bug reports, and pull requests are welcome. If you find a problem or have
an idea for improving the app, please open an issue to start the conversation.

## License

No license is currently specified. Contact the repository owner before
redistributing or using this project beyond the permissions provided by GitHub.
