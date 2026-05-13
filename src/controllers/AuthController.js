'use strict';

class AuthController {
  constructor(authService) {
    this._svc = authService;
    ['showLogin', 'login', 'signup', 'logout'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  showLogin(req, res) {
    if (req.session && req.session.usuario) return res.redirect('/panel');
    res.render('auth/login', {
      layout:      'layouts/auth',
      title:       'Acceso — FarmaTrack',
      error:       req.flash('error'),
      email:       req.flash('email'),
      signupError: req.flash('signupError'),
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const usuarioSesion = await this._svc.login(email, password);
      req.session.regenerate((err) => {
        if (err) { req.flash('error', 'Error de sesión.'); return res.redirect('/auth/login'); }
        req.session.usuario = usuarioSesion;
        req.session.save((err2) => {
          if (err2) { req.flash('error', 'Error al guardar sesión.'); return res.redirect('/auth/login'); }
          res.redirect('/panel');
        });
      });
    } catch (err) {
      req.flash('error', err.message);
      req.flash('email', email || '');
      res.redirect('/auth/login');
    }
  }

  async signup(req, res) {
    try {
      const usuarioSesion = await this._svc.signup(req.body);
      req.session.regenerate((err) => {
        if (err) { req.flash('signupError', 'Error de sesión.'); return res.redirect('/auth/login?tab=signup'); }
        req.session.usuario = usuarioSesion;
        req.session.save((err2) => {
          if (err2) { req.flash('signupError', 'Error al guardar sesión.'); return res.redirect('/auth/login?tab=signup'); }
          res.redirect('/panel');
        });
      });
    } catch (err) {
      req.flash('signupError', err.message);
      res.redirect('/auth/login?tab=signup');
    }
  }

  logout(req, res) {
    req.session.destroy(() => res.redirect('/auth/login'));
  }
}

module.exports = AuthController;
