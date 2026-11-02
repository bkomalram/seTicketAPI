'use strict';
function fail(message, status) { const error = new Error(message); error.status = status || 400; throw error; }
function quantity(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || n > 2147483647) fail('El límite debe ser un entero entre 0 y 2147483647.');
  return n;
}
function number(type, value) {
  const s = String(value);
  if (!['CHANCE','BILLETE'].includes(type) || !/^\d+$/.test(s) || (type === 'CHANCE' ? s.length > 2 : s.length < 3 || s.length > 4)) fail('Número o tipo inválido. Usa chances de 00 a 99 o billetes de 3 a 4 dígitos.');
  return type === 'CHANCE' ? s.padStart(2, '0') : s;
}
function config(body) {
  if (!Array.isArray(body.exceptions) || body.exceptions.length > 1000) fail('Las excepciones deben ser una lista de hasta 1000 números.');
  const seen = new Set();
  return { chance: quantity(body.chance), billete: quantity(body.billete), exceptions: body.exceptions.map(e => {
    const numero = number(e.tipo, e.numero), key = e.tipo + ':' + numero;
    if (seen.has(key)) fail('Hay excepciones duplicadas.');
    seen.add(key);
    const maximo = quantity(e.maximo);
    if (maximo === null) fail('Indica un límite para cada excepción.');
    return { tipo: e.tipo, numero, maximo };
  }) };
}
function maximum(config, tipo, numero) {
  const exception = config.exceptions.find(e => e.tipo === tipo && e.numero === numero);
  return exception ? exception.maximo : config[tipo === 'CHANCE' ? 'chance' : 'billete'];
}
function validateRecords(records) {
  if (!Array.isArray(records) || !records.length || records.length > 1000) fail('Agrega entre 1 y 1000 registros al ticket.');
  return records.map(r => {
    const numero = number(r.tipo, r.numero), cantidad = quantity(r.cantidad), precio = Number(r.precio), valor = Number(r.valor);
    if (!cantidad || !Number.isFinite(precio) || precio < 0 || !Number.isFinite(valor) || valor < 0 || Math.abs(cantidad * precio - valor) > .011) fail('Cantidad o importe inválido en el número ' + numero + '.');
    return Object.assign({}, r, {numero, cantidad, precio, valor});
  });
}
function check(config, sold, records) {
  const requested = {};
  records.forEach(r => { const key = r.tipo + ':' + r.numero; requested[key] = (requested[key] || 0) + r.cantidad; });
  Object.keys(requested).forEach(key => {
    const [tipo, numero] = key.split(':'), max = maximum(config, tipo, numero), used = Number(sold[key] || 0);
    if (max !== null && requested[key] + used > max) fail('Cupo insuficiente para ' + numero + '. Disponible: ' + Math.max(0, max - used) + '. Límite: ' + max + '.', 409);
  });
}
module.exports = {fail, quantity, number, config, maximum, validateRecords, check};
