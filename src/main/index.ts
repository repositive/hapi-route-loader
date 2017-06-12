import * as _glob from 'glob';
import { promisify, all } from 'bluebird';
import { isAbsolute, join} from 'path';
import {Server, RouteConfiguration as Route} from 'hapi';

const glob: (s: string) => Promise<string[]> = <any> promisify(_glob);


export function isRoute(o: any): o is Route {
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  function isValidMethod(method: any) {
    return typeof method === 'string'
      && validMethods.indexOf(method) > -1
      || validMethods.map(m => m.toLowerCase()).indexOf(method) > -1;
  }

  return o
    && typeof o.path === 'string'
    && Array.isArray(o.method)
      ? o.method.reduce((acc: boolean, m: any) => acc && isValidMethod(m), true)
      : isValidMethod(o.method)
    && !o.handler || typeof o.handler === 'function';
}

export interface PluginOptions {
  match?: string;
}

export class PluginOptionsError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

const routes: any = function(server: Server, { match }: PluginOptions, next: (err?: Error) => void) {
  async function populate() {

    if (!match) {
      return Promise.reject(new PluginOptionsError('The "match" parameter is mandatory for this plugin to run'));
    }
    const files = await glob(match);
    return all(
      files.map((f) => {
        const full_path = isAbsolute(f) ? f : join(__dirname, f);
        return require(full_path);
      })
    )
      .then(modules => modules.filter(isRoute))
      .then(modules => modules.map(server.route));
  }

  populate()
  .then(() => {
    next();
  })
  .catch((err: Error) => {
    next(err);
  });
};

routes.attributes = {
    name: 'routes',
    version: '1.0.0'
};

export default routes;
