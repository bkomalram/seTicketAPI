const DB = require('../models');

// Consultar el estado actual invalida también los JWT emitidos antes de desactivar.
module.exports = async function activeUser(req, res, next) {
  if (!req.jornada || !req.jornada.id) return next();
  try {
    const user = await DB.User.findOne({
      where: { id: req.jornada.id, esActivo: 'SI' },
      attributes: ['id']
    });
    if (!user) {
      return res.status(401).json({ resultado: 'Cuenta deshabilitada. Ingresa nuevamente.', exitoso: false });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
