## Building

You first need to run the backend project because we use the OpenApi schema of that project to create clients/zod-schemas for this one.
After that, copy and paste the ip/port of the backend app into the openapitools.json and package.json:open-api:zod files and
then run this command:

```bash
# create the clients and zod schemas
npm run open-api:generate
```

## Developing

Once you've build the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Production

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
