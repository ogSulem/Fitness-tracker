const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const User = require('../models/User');

const goalsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100,
    message: 'Слишком много запросов. Попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false
});

// @route   GET api/goals
// @desc    Получение всех целей пользователя
// @access  Private
router.get('/', goalsLimiter, auth, async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET api/goals/:id
// @desc    Получение цели по ID
// @access  Private
router.get('/:id', goalsLimiter, auth, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Цель не найдена' });
        }

        // Проверка прав доступа
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        res.json(goal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Цель не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST api/goals
// @desc    Создание новой цели
// @access  Private
router.post(
    '/',
    goalsLimiter,
    auth,
    [
        check('title', 'Название цели обязательно').not().isEmpty(),
        check('type', 'Тип цели обязателен').not().isEmpty(),
        check('startValue', 'Начальное значение обязательно').isNumeric(),
        check('targetValue', 'Целевое значение обязательно').isNumeric(),
        check('deadline', 'Срок выполнения обязателен').isISO8601()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, type, startValue, currentValue, targetValue, unit, deadline, description } = req.body;

            const newGoal = new Goal({
                user: req.user.id,
                title,
                type,
                startValue,
                currentValue: currentValue || startValue,
                targetValue,
                unit: unit || 'кг',
                deadline,
                description,
                completed: false
            });

            const goal = await newGoal.save();
            res.json(goal);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// @route   PUT api/goals/:id
// @desc    Обновление цели
// @access  Private
router.put('/:id', goalsLimiter, auth, async (req, res) => {
    try {
        const { title, type, startValue, currentValue, targetValue, unit, deadline, description, completed } = req.body;

        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Цель не найдена' });
        }

        // Проверка прав доступа
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        // Обновление полей
        if (title) goal.title = title;
        if (type) goal.type = type;
        if (startValue) goal.startValue = startValue;
        if (currentValue !== undefined) goal.currentValue = currentValue;
        if (targetValue) goal.targetValue = targetValue;
        if (unit) goal.unit = unit;
        if (deadline) goal.deadline = deadline;
        if (description !== undefined) goal.description = description;
        if (completed !== undefined) goal.completed = completed;

        // Сохранение изменений
        await goal.save();
        res.json(goal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Цель не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   PUT api/goals/:id/progress
// @desc    Обновление прогресса цели
// @access  Private
router.put('/:id/progress', goalsLimiter, auth, async (req, res) => {
    try {
        const { currentValue, completed } = req.body;

        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Цель не найдена' });
        }

        // Проверка прав доступа
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        // Обновление прогресса
        if (currentValue !== undefined) goal.currentValue = currentValue;
        if (completed !== undefined) goal.completed = completed;

        // Автоматическое определение завершенности цели в зависимости от типа
        if (goal.type === 'вес' || goal.type === 'сила') {
            // Для целей по снижению или увеличению веса/силы
            if (goal.startValue < goal.targetValue) {
                // Цель на увеличение
                goal.completed = goal.currentValue >= goal.targetValue;
            } else {
                // Цель на уменьшение
                goal.completed = goal.currentValue <= goal.targetValue;
            }
        }

        // Сохранение изменений
        await goal.save();
        res.json(goal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Цель не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   DELETE api/goals/:id
// @desc    Удаление цели
// @access  Private
router.delete('/:id', goalsLimiter, auth, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Цель не найдена' });
        }

        // Проверка прав доступа
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Нет прав доступа' });
        }

        await goal.deleteOne();
        res.json({ message: 'Цель удалена' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Цель не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router; 