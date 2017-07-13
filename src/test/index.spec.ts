import * as test from 'tape';
import {Test} from 'tape';
import { spy, stub } from 'sinon';
import * as mock from 'mock-require';


test('All goes well', (t: Test) => {
  mock('/root.js', {
    path: '/',
    method: 'GET',
    handler: spy()
  });

  mock('glob', function(str: string, o: any, cb: any) {
    return cb(undefined, ['/root.js']);
  });

  const plugin = (mock.reRequire('../main/index') as any).default;

  const serverMock = {route: spy()};

  plugin(serverMock, {match: 'dist/main/routes/**/_*.js'}, (err?: Error) => {
    t.equals(serverMock.route.callCount, 1, 'For each valid route call the server');
    t.notOk(err, 'No errors here');
    t.end();
  });

});

test('Does not load non valid routes', (t: Test) => {

  mock('/false.js', {});

  mock('/invalid.js', {
    path: '/invalid',
    method: 'POST',
    handler: false
  });

  mock('glob', function(str: string, o: any, cb: any) {
    return cb(undefined, ['/false.js']);
  });


  const plugin = (mock.reRequire('../main/index') as any).default;
  const serverMock = {route: spy()};

  plugin(serverMock, {match: 'dist/main/routes/**/_*.js'}, (err?: Error) => {
    t.equals(serverMock.route.callCount, 0, 'For each valid route call the server');
    t.notOk(err, 'No errors here');
    t.end();
  });

});

test('Loads routes with multiple methods', (t: Test) => {

  const route = {
    path: '/multiple',
    method: ['GET', 'POST']
  };
  mock('/multiple-methods.js', route);

  mock('glob', function(str: string, o: any, cb: any) {
    return cb(undefined, ['/multiple-methods.js']);
  });

  const plugin = (mock.reRequire('../main/index') as any).default;

  const serverMock = {route: spy()};

  plugin(serverMock, {match: 'dist/main/routes/**/_*.js'}, (err?: Error) => {
    t.equals(serverMock.route.callCount, 1, 'For each valid route call the server');
    t.deepEquals(serverMock.route.getCall(0).args, [route], 'The server route loader is called with the route');
    t.notOk(err, 'No errors here');
    t.end();
  });

});

test('Sever does not like the route', (t: Test) => {


  mock('/valid', {
    path: '/',
    method: 'GET'
  });

  mock('glob', function(str: string, o: any, cb: any) {
    return cb(undefined, ['/valid.js']);
  });

  const plugin = (mock.reRequire('../main/index') as any).default;
  const serverMock = {route: stub().throws()};

  plugin(serverMock, {match: 'dist/main/routes/**/_*.js'}, (err?: Error) => {
    t.ok(err, 'Should return an error to the callback if it blows up');
    t.end();
  });

});

test('Require fails to load a  route', (t: Test) => {

  const plugin = (mock.reRequire('../main/index') as any).default;

  plugin(spy(), {match: 'dist/main/routes/**/_*.js'}, (err?: Error) => {
    t.ok(err, 'Should return an error to the callback if it blows up');
    t.end();
  });

});

test('Return an error if required arguments are not passed to it', (t: Test) => {

  const plugin = (mock.reRequire('../main/index') as any).default;

  plugin(spy(), {}, (err?: Error) => {
    t.equals(err && err.message, 'The "match" parameter is mandatory for this plugin to run', 'Returns the valid error');
    t.end();
  });

});
