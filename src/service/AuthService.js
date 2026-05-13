'use strict';
const AppError = require('../utils/AppError');

class AuthService {
  constructor(usuarioRepository) {
    this._repo = usuarioRepository;
  }

  async login(email, password) {
    if (!email || !email.trim()) throw new AppError('El correo es requerido.', 400);
    if (!password)               throw new AppError('La contraseña es requerida.', 400);

    const usuario = await this._repo.findByEmail(email.trim());
    if (!usuario)            throw new AppError('Credenciales incorrectas.', 401);
    if (!usuario.activo)     throw new AppError('Tu cuenta está desactivada.', 403);
    if (!usuario.verificarPassword(password)) throw new AppError('Credenciales incorrectas.', 401);

    return usuario.toSession();
  }

  async signup({ nombre, email, password, confirmPassword, rol, cargo }) {
    if (!nombre || !nombre.trim()) throw new AppError('El nombre completo es requerido.', 400);
    if (!email || !email.trim())   throw new AppError('El correo es requerido.', 400);
    if (!password)                 throw new AppError('La contraseña es requerida.', 400);
    if (password.length < 4)       throw new AppError('La contraseña debe tener mínimo 4 caracteres.', 400);
    if (password !== confirmPassword) throw new AppError('Las contraseñas no coinciden.', 400);
    if (!rol)                      throw new AppError('Selecciona un rol.', 400);

    const existe = await this._repo.findByEmail(email.trim());
    if (existe) throw new AppError('Ya existe una cuenta con ese correo.', 409);

    const nuevo = await this._repo.create({
      nombre:   nombre.trim(),
      email:    email.trim().toLowerCase(),
      password: password,
      rol,
      cargo:    cargo || rol,
    });

    return nuevo.toSession();
  }
}

module.exports = AuthService;
