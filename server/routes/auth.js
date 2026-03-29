const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Настройка лимитера для защиты от брутфорса
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // 5 попыток
    message: 'Слишком много попыток входа. Попробуйте позже.',
    standardHeaders: true, // возвращать стандартные заголовки rate limit 
    legacyHeaders: false, // отключить устаревшие заголовки X-RateLimit-*
    // Настройка для решения проблемы с X-Forwarded-For
    skipFailedRequests: false,
    skipSuccessfulRequests: false
});

// @route   POST api/auth/register
// @desc    Регистрация пользователя
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Имя обязательно').not().isEmpty(),
        check('email', 'Введите корректный email').isEmail(),
        check('password', 'Пароль должен содержать не менее 6 символов').isLength({ min: 6 }),
        check('gender', 'Пол обязателен').isIn(['male', 'female']),
        check('age', 'Возраст должен быть от 15 до 100').isInt({ min: 15, max: 100 }),
        check('weight', 'Вес должен быть от 30 до 200 кг').isFloat({ min: 30, max: 200 }),
        check('height', 'Рост должен быть от 100 до 250 см').isFloat({ min: 100, max: 250 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password, gender, age, weight, height } = req.body;

            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            user = new User({
                name,
                email,
                password,
                gender,
                age,
                weight,
                height,
                weightHistory: [{ weight }],
                goals: [],
                workouts: []
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'turik_fittrack_secret_key_123',
                { expiresIn: '7d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            gender: user.gender,
                            age: user.age,
                            weight: user.weight,
                            height: user.height
                        }
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Ошибка сервера');
        }
    }
);

// @route   POST api/auth/login
// @desc    Аутентификация пользователя
// @access  Public
router.post(
    '/login',
    loginLimiter,
    [
        check('email', 'Введите корректный email').isEmail(),
        check('password', 'Пароль обязателен').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Неверные учетные данные' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверные учетные данные' });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'turik_fittrack_secret_key_123',
                { expiresIn: '7d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            gender: user.gender,
                            age: user.age,
                            weight: user.weight,
                            height: user.height
                        }
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Ошибка сервера');
        }
    }
);

// @route   GET api/auth/user
// @desc    Получение данных текущего пользователя
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// Rate limiter for forgot-password (prevent spam)
const forgotLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Слишком много запросов. Попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false,
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset — generates a secure token valid 1 hour.
//          In production, send the link via email (configure SMTP_* env vars).
//          In development the link is returned directly in the response so you
//          can test without an email server.
// @access  Public
router.post(
    '/forgot-password',
    forgotLimiter,
    [check('email', 'Введите корректный email').isEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findOne({ email: req.body.email });

            // Always respond with 200 to avoid leaking whether email exists
            if (!user) {
                return res.json({
                    message: 'Если пользователь с таким email существует, ссылка для сброса пароля будет отправлена.'
                });
            }

            // Generate crypto-random token
            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            const resetLink = `${clientUrl}/reset-password/${token}`;

            // --- Email sending (optional) ---
            // If you configure nodemailer, uncomment and fill in SMTP_* env vars:
            // const transporter = nodemailer.createTransport({ ... });
            // await transporter.sendMail({ to: user.email, subject: 'Сброс пароля', text: resetLink });

            // In development: return the reset link directly so you can test
            if (process.env.NODE_ENV !== 'production') {
                return res.json({
                    message: 'Ссылка для сброса пароля создана (dev-режим: email не отправляется).',
                    resetLink // remove this in production
                });
            }

            res.json({ message: 'Ссылка для сброса пароля отправлена на ваш email.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Ошибка сервера');
        }
    }
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using the token received via forgot-password
// @access  Public
router.post(
    '/reset-password/:token',
    [check('password', 'Пароль должен содержать не менее 6 символов').isLength({ min: 6 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ message: 'Ссылка для сброса пароля недействительна или истекла.' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.json({ message: 'Пароль успешно изменён. Теперь вы можете войти.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Ошибка сервера');
        }
    }
);

module.exports = router;