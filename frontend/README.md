## Building

Since we need the API url of our backend in our frontend, you will need to create an `.env` file in the root of frontend folder and add the following line:

```bash
PUBLIC_API_URL = http://127.0.0.1:<port> # port defaults to 8080 if you have followed the steps in backend/README.md file
```

You first need to run the backend project because we use the OpenApi schema of that project to create clients/zod-schemas for this one.
execute this to generate the clients/schemas:

```bash
# create the clients and zod schemas
npm run open-api:generate:[linux | windows] # generates the open-api clients and zod schemas from localhost:<port>/openapi.json (port defaults to 8080 if you have followed the steps in backend/README.md file)
```

- OpenApiTools requires [java](https://www.oracle.com/java/technologies/downloads/) installed on your machine.

## Developing (IMPORTANT)

Some dependencies, such as `svelte-fa`, haven't updated their peer dependency versions to accept Svelte 5. Therefore, you will need to install packages using the `--legacy-peer-deps` flag.

Once you've build the project and installed dependencies with `npm install --legacy-peer-deps`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Testing

For this to work you need to create an exact copy of your `.env` file then rename it to `.env.integration`. After that change the values to connect to our test backend service which should connect to a test database (the default configured port is 8090 - see backend/README.md).

## Production

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
