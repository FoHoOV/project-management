## Building

You first need to run the backend project because we use the OpenApi schema of that project to create clients/zod-schemas for this one.
After that, copy and paste the ip/port of the backend app into the openapitools.json file and package.jsonopen-api:zod run command
then execute this:

```bash
# create the clients and zod schemas
npm run open-api:generate # generates the open-api clients and zod schemas from localhost:<port>/openapi.json (port defaults to 8080 if you have followed the steps in backend/README.md file)
```
Since we need the API url of our backend in our frontend, you will need to create an `.env` file in the root of frontend folder and add the following line:

```bash
PUBLIC_API_URL = http://127.0.0.1:<port> # port defaults to 8080 if you have followed the steps in backend/README.md file
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
