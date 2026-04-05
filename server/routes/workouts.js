const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const workoutsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100,
    message: 'Слишком много запросов. Попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false
});

// @route   GET api/workouts
// @desc    Получение всех тренировок пользователя
// @access  Private
router.get('/', workoutsLimiter, auth, async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
        res.json(workouts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET api/workouts/date/:date
// @desc    Получение тренировок на определенную дату
// @access  Private
// NOTE: This route MUST be declared before /:id to prevent Express from
//       treating the literal string "date" as a MongoDB ObjectId.
router.get('/date/:date', workoutsLimiter, auth, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const workouts = await Workout.find({
            user: req.user.id,
            date: {
                $gte: date,
                $lt: nextDay
            }
        }).sort({ time: 1 });

        res.json(workouts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET api/workouts/range/:start/:end
// @desc    Получение тренировок в диапазоне дат
// @access  Private
router.get('/range/:start/:end', workoutsLimiter, auth, async (req, res) => {
    try {
        const startDate = new Date(req.params.start);
        const endDate = new Date(req.params.end);
        endDate.setDate(endDate.getDate() + 1); // Включаем конечную дату

        const workouts = await Workout.find({
            user: req.user.id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).sort({ date: 1, time: 1 });

        res.json(workouts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET api/workouts/:id
// @desc    Получение тренировки по ID
// @access  Private
// NOTE: This route is declared AFTER all specific named routes (/date/:date,
//       /range/:start/:end) so it does not shadow them.
router.get('/:id', workoutsLimiter, auth, async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Тренировка не найдена' });
        }

        // Проверка принадлежности тренировки пользователю
        if (workout.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        res.json(workout);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Тренировка не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST api/workouts
// @desc    Создание новой тренировки
// @access  Private
router.post(
    '/',
    [
        workoutsLimiter,
        auth,
        [
            check('type', 'Тип тренировки обязателен').not().isEmpty(),
            check('date', 'Дата обязательна').not().isEmpty(),
            check('time', 'Время обязательно').not().isEmpty(),
            check('duration', 'Продолжительность обязательна').isNumeric()
        ]
    ],
    async (req, res) => {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, date, time, duration, comment, caloriesBurned, intensity } = req.body;

        try {
            // Создание новой тренировки
            const newWorkout = new Workout({
                user: req.user.id,
                type,
                date,
                time,
                duration,
                comment,
                caloriesBurned,
                intensity
            });

            // Сохранение тренировки
            const workout = await newWorkout.save();
            res.json(workout);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   PUT api/workouts/:id
// @desc    Обновление тренировки
// @access  Private
router.put(
    '/:id',
    [
        workoutsLimiter,
        auth,
        [
            check('type', 'Тип тренировки обязателен').not().isEmpty(),
            check('date', 'Дата обязательна').not().isEmpty(),
            check('time', 'Время обязательно').not().isEmpty(),
            check('duration', 'Продолжительность обязательна').isNumeric()
        ]
    ],
    async (req, res) => {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, date, time, duration, comment, caloriesBurned, intensity } = req.body;

        try {
            // Поиск тренировки
            let workout = await Workout.findById(req.params.id);

            // Проверка существования тренировки
            if (!workout) {
                return res.status(404).json({ message: 'Тренировка не найдена' });
            }

            // Проверка принадлежности тренировки пользователю
            if (workout.user.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Нет прав доступа' });
            }

            // Обновление полей
            workout.type = type;
            workout.date = date;
            workout.time = time;
            workout.duration = duration;
            workout.comment = comment;
            workout.caloriesBurned = caloriesBurned;
            workout.intensity = intensity;

            // Сохранение тренировки
            await workout.save();
            res.json(workout);
        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ message: 'Тренировка не найдена' });
            }
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   DELETE api/workouts/:id
// @desc    Удаление тренировки
// @access  Private
router.delete('/:id', workoutsLimiter, auth, async (req, res) => {
    try {
        // Поиск тренировки
        const workout = await Workout.findById(req.params.id);

        // Проверка существования тренировки
        if (!workout) {
            return res.status(404).json({ message: 'Тренировка не найдена' });
        }

        // Проверка принадлежности тренировки пользователю
        if (workout.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        // Удаление тренировки
        await workout.deleteOne();
        res.json({ message: 'Тренировка удалена' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Тренировка не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router; 