// Run with: node tests/user-deactivation.test.js (no database or dependencies needed).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
function load(file, dependencies) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), {
    module, exports: module.exports, require: name => {
      if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
      return dependencies[name];
    }, console, process: { env: {} }
  }, { filename: file });
  return module.exports;
}
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
(async () => {
  const records = [{ id: 10, padreUsuario_id: 1, esActivo: 'SI', nombre: 'Prueba', history: [123] },
    { id: 20, padreUsuario_id: 2, esActivo: 'SI' }];
  let calls = 0;
  const DB = { User: { async update(values, options) {
    calls++;
    assert.deepStrictEqual(Object.keys(values), ['esActivo']);
    assert.strictEqual(values.esActivo, 'NO');
    const record = records.find(row => Object.keys(options.where).every(key => row[key] === options.where[key]));
    if (!record) return [0];
    Object.assign(record, values);
    return [1];
  } } };
  let deactivate;
  const router = { get() {}, post() {}, patch(route, handler) { assert.strictEqual(route, '/:userId/desactivar'); deactivate = handler; } };
  load('src/routes/usuarios.js', { dotenv: { config() {} }, express: { Router: () => router }, jsonwebtoken: {}, '../models/index': DB });
  async function request(id, access = 3, caller = 1) {
    const res = response();
    await deactivate({ params: { userId: String(id) }, jornada: { id: caller, accesos: access } }, res, error => { throw error; });
    return res;
  }
  assert.strictEqual((await request(10, 1)).code, 403);
  assert.strictEqual((await request(10)).code, 200);
  assert.strictEqual(records[0].esActivo, 'NO');
  assert.strictEqual(records.length, 2);
  assert.deepStrictEqual(records[0].history, [123]);
  assert.strictEqual(records[0].nombre, 'Prueba');
  assert.strictEqual((await request(10)).code, 404); // already inactive
  assert.strictEqual((await request(20)).code, 404); // different owner
  assert.strictEqual(records[1].esActivo, 'SI');
  const before = calls;
  for (const invalid of ['0', '-1', 'abc', '1.5', '9007199254740992']) assert.strictEqual((await request(invalid)).code, 400);
  assert.strictEqual((await request(1)).code, 400); // own account
  assert.strictEqual((await request(20, null)).code, 403);
  assert.strictEqual(calls, before);
  const failure = new Error('DB unavailable');
  DB.User.update = async () => { throw failure; };
  let forwarded;
  await deactivate({ params: { userId: '20' }, jornada: { id: 1, accesos: 3 } }, response(), error => { forwarded = error; });
  assert.strictEqual(forwarded, failure);

  let active = true;
  const activeUser = load('src/middleware/active-user.js', { '../models': { User: { async findOne(options) {
    assert.strictEqual(options.where.esActivo, 'SI');
    return active ? { id: options.where.id } : null;
  } } } });
  let nextCalls = 0;
  const next = error => { if (error) throw error; nextCalls++; };
  await activeUser({}, response(), next); // public page
  await activeUser({ jornada: { accesos: 0 } }, response(), next); // initial login token
  await activeUser({ jornada: { id: 1 } }, response(), next);
  assert.strictEqual(nextCalls, 3);
  active = false;
  const denied = response();
  await activeUser({ jornada: { id: 1 } }, denied, next);
  assert.strictEqual(denied.code, 401);
  assert.strictEqual(denied.body.exitoso, false);
  assert.strictEqual(nextCalls, 3);
  // Exercise the actual dialog controller without touching a real account.
  const html = fs.readFileSync(path.join(root, 'views/admin-area.ejs'), 'utf8');
  const controller = html.slice(html.indexOf("      const deactivateDialog"), html.indexOf("      function editUser"));
  const elements = {};
  for (const id of ['deactivate-user-dialog', 'confirm-deactivate', 'cancel-deactivate', 'deactivate-error', 'deactivate-user-name', 'user-action-message', 'userId']) {
    elements[id] = { hidden: false, disabled: false, value: '', listeners: {},
      addEventListener(event, handler) { this.listeners[event] = handler; }, focus() {},
      showModal() { this.open = true; }, close() { this.open = false; if (this.listeners.close) this.listeners.close(); }
    };
  }
  let fetchCalls = 0;
  let requestOptions;
  let succeed = true;
  let resetCalls = 0;
  const context = { document: { getElementById: id => elements[id] }, api: '/',
    localStorage: { getItem: () => 'test-token' }, resetForm() { resetCalls++; },
    async fetch(url, options) {
      fetchCalls++; requestOptions = options;
      assert.strictEqual(url, '/usuarios/10/desactivar');
      return { ok: succeed, async json() { return { exitoso: succeed, resultado: 'Error de prueba' }; } };
    }
  };
  vm.runInNewContext(controller, context);
  const row = { removed: false, remove() { this.removed = true; } };
  const dialog = elements['deactivate-user-dialog'];
  context.requestDeactivation({ id: 10, nombre: '<Prueba>' }, row);
  assert.strictEqual(elements['deactivate-user-name'].textContent, '<Prueba>');
  elements['cancel-deactivate'].listeners.click();
  assert.strictEqual(dialog.open, false);
  assert.strictEqual(fetchCalls, 0);
  context.requestDeactivation({ id: 10, nombre: 'Prueba' }, row);
  succeed = false;
  await elements['confirm-deactivate'].listeners.click();
  assert.strictEqual(row.removed, false);
  assert.strictEqual(dialog.open, true);
  assert.strictEqual(elements['deactivate-error'].hidden, false);
  assert.strictEqual(elements['confirm-deactivate'].disabled, false);
  succeed = true;
  elements.userId.value = '10';
  await elements['confirm-deactivate'].listeners.click();
  assert.strictEqual(requestOptions.method, 'PATCH');
  assert.strictEqual(row.removed, true);
  assert.strictEqual(dialog.open, false);
  assert.strictEqual(resetCalls, 1);
  assert.strictEqual(elements['user-action-message'].hidden, false);
  console.log('PASS: soft deactivation, permissions, ownership, self protection, retained history, repeated requests, errors and existing-session rejection; dialog cancellation, failures and successful row removal.');
})().catch(error => { console.error(error); process.exitCode = 1; });
