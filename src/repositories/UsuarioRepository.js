'use strict';
const UsuarioSchema = require('../models/UsuarioSchema');
const Usuario       = require('../models/Usuario');

class UsuarioRepository {
  async findByEmail(email) {
    const doc = await UsuarioSchema.findOne({ email: email.trim().toLowerCase() }).lean();
    return doc ? Usuario.fromDB({ ...doc, id: doc._id.toString() }) : null;
  }

  async findById(id) {
    const doc = await UsuarioSchema.findById(id).lean();
    return doc ? Usuario.fromDB({ ...doc, id: doc._id.toString() }) : null;
  }

  async create(data) {
    const doc = await UsuarioSchema.create({
      nombre:   data.nombre,
      email:    data.email,
      password: data.password,
      rol:      data.rol,
      cargo:    data.cargo || data.rol,
      activo:   true,
    });
    return Usuario.fromDB({ ...doc.toObject(), id: doc._id.toString() });
  }
}

module.exports = UsuarioRepository;
