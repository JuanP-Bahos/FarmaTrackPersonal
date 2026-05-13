'use strict';

require('dotenv').config();

const express        = require('express');
const path           = require('path');
const morgan         = require('morgan');
const session        = require('express-session');
const MongoStore     = require('connect-mongo');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const config    = require('../config/app');
const router    = require('./routes/index');
const connectDB = require('../config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.set('trust proxy', 1);

// ── Vistas ──────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ── Middlewares ─────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Sesión con MongoDB ──────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'farmatrack-secret-2025',
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:       process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl:            60 * 60 * 8,
  }),
  cookie: {
    maxAge:   1000 * 60 * 60 * 8,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// ── Flash ───────────────────────────────────────────────────────
app.use(flash());

// ── Locals globales ─────────────────────────────────────────────
app.use((req, res, next) => {
  const usuario = req.session.usuario || null;
  const rol     = usuario && usuario.rol;
  res.locals.appName       = config.app.name;
  res.locals.currentPath   = req.path;
  res.locals.currentUser   = usuario;
  res.locals.dashboardPath  = rol === 'operario' ? '/mis-lotes' : '/panel';
  res.locals.dashboardLabel = rol === 'operario' ? 'Mis lotes asignados' : 'Panel de lotes';
  next();
});

// ── Rutas ───────────────────────────────────────────────────────
app.use('/', router);

// ── Errores ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Arranque ────────────────────────────────────────────────────
connectDB().then(() => {
  const port = process.env.PORT || config.server.port;
  app.listen(port, () => {
    console.log(`\n🚀 FarmaTrack corriendo en: http://localhost:${port}`);
    console.log(`🔐 Login:  http://localhost:${port}/auth/login`);
    console.log(`📋 Panel:  http://localhost:${port}/panel\n`);
  });
});

module.exports = app;
