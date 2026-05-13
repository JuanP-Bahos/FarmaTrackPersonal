'use strict';
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre:   { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol:      { type: String, required: true, enum: ['director_tecnico', 'operario', 'calidad'], default: 'operario' },
    cargo:    { type: String, default: '' },
    activo:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
