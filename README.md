@repositive/hapi-route-loader
---

Load hapi routes into the hapi router from a folder

**How to use**

First define your routes in any folder you like. Your routes must complain with the route schema definition:

```ts
export interface RouteConfiguration {
  path: string;
  method: HTTP_METHODS_PARTIAL | '*' | (HTTP_METHODS_PARTIAL | '*')[];
  vhost?: string;
  handler?: string | RouteHandler | RouteHandlerPlugins;
  config?: RouteAdditionalConfigurationOptions | ((server: Server) => RouteAdditionalConfigurationOptions);
}
```

Initialize it as a hapi plugin:

```ts
import { Server } from 'hapi';
import { promisify } from 'bluebird';
import routeLoader from '@repositive/hapi-route-loader';


async function startApi() {
  const server = new Server();
  const register: any = promisify(server.register, {context: server});
  const start: any = promisify(server.start, {context: server});
  
  server.connection({
    port: 3000
  });
  
  await register({
    register: routeLoader,
    options: {
      /**
       *  match needs to point to the compiled js files that you want to load.
       */
      match: `dist/routes/**/*.js`
    }
  });
  
  await start();

  console.log('API initialized');
}

```

**Notes**

The resitory has git hooks on `precommit` and `prepush`. You need to pass the linting criteria before commit and the test and coverage criteria before push. The test requirements are 80% overall.

The only file that is not evaluated during testing is the `index.ts`. DO NOT MODIFY THIS FILE unless is completely necessary. 
