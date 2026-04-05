const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');

const profileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Слишком много запросов. Попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false
});

// @route   PUT api/users/profile
// @desc    Обновление профиля пользователя
// @access  Private
router.put(
    '/profile',
    profileLimiter,
    auth,
    [
        check('name', 'Имя обязательно').not().isEmpty(),
        check('gender', 'Пол обязателен').isIn(['male', 'female']),
        check('age', 'Возраст должен быть от 15 до 100').isInt({ min: 15, max: 100 }),
        check('weight', 'Вес должен быть от 30 до 200 кг').isFloat({ min: 30, max: 200 }),
        check('height', 'Рост должен быть от 100 до 250 см').isFloat({ min: 100, max: 250 }),
        check('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'veryActive'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, gender, age, weight, height, activityLevel } = req.body;

            let user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            user.name = name;
            user.gender = gender;
            user.age = age;

            if (activityLevel) user.activityLevel = activityLevel;

            if (weight !== undefined && weight !== user.weight) {
                user.weight = weight;
                user.weightHistory.push({
                    weight,
                    date: Date.now()
                });
            }

            if (height !== undefined) user.height = height;

            await user.save();

            const updatedUser = await User.findById(req.user.id).select('-password');
            res.json(updatedUser);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   GET api/users/weight-history
// @desc    Получение истории веса пользователя
// @access  Private
router.get('/weight-history', profileLimiter, auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const history = user.weightHistory.slice(-30);
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST api/users/goals
// @desc    Добавление новой цели
// @access  Private
router.post(
    '/goals',
    profileLimiter,
    auth,
    [
        check('type', 'Тип цели обязателен').isIn(['weight', 'workout', 'calories']),
        check('target', 'Целевое значение обязательно').isNumeric(),
        check('deadline', 'Срок выполнения обязателен').isISO8601()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { type, target, deadline } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            user.goals.push({
                type,
                target,
                current: 0,
                deadline: new Date(deadline),
                completed: false
            });

            await user.save();
            res.json(user.goals);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   GET api/users/goals
// @desc    Получение целей пользователя
// @access  Private
router.get('/goals', profileLimiter, auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json(user.goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST api/users/workouts
// @desc    Добавление новой тренировки
// @access  Private
router.post(
    '/workouts',
    profileLimiter,
    auth,
    [
        check('name', 'Название тренировки обязательно').not().isEmpty(),
        check('type', 'Тип тренировки обязателен').isIn(['strength', 'cardio', 'flexibility']),
        check('duration', 'Длительность обязательна').isNumeric(),
        check('calories', 'Калории обязательны').isNumeric()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, type, duration, calories, exercises } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            user.workouts.push({
                name,
                type,
                duration,
                calories,
                exercises: exercises || [],
                date: Date.now()
            });

            await user.save();
            res.json(user.workouts);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   GET api/users/workouts
// @desc    Получение тренировок пользователя
// @access  Private
router.get('/workouts', profileLimiter, auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json(user.workouts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router; 