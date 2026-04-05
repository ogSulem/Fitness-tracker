const express = require('express');
const router = express.Router();
const WorkoutRecommendation = require('../models/WorkoutRecommendation');
const auth = require('../middleware/auth');

// Получить все рекомендации
router.get('/', auth, async (req, res) => {
    try {
        const recommendations = await WorkoutRecommendation.find();
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Получить рекомендацию по цели и уровню
router.get('/:goal/:level', auth, async (req, res) => {
    try {
        const recommendation = await WorkoutRecommendation.findOne({
            goal: req.params.goal,
            level: req.params.level
        });

        if (!recommendation) {
            return res.status(404).json({ message: 'Рекомендация не найдена' });
        }

        res.json(recommendation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Добавить новую рекомендацию (защищено — только аутентифицированный пользователь)
router.post('/', auth, async (req, res) => {
    const recommendation = new WorkoutRecommendation({
        goal: req.body.goal,
        level: req.body.level,
        frequency: req.body.frequency,
        duration: req.body.duration,
        types: req.body.types,
        tips: req.body.tips
    });

    try {
        const newRecommendation = await recommendation.save();
        res.status(201).json(newRecommendation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 