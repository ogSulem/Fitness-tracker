const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoodEntry = require('../models/FoodEntry');

// Built-in food database (per 100g)
const FOODS = [
    { name: 'Куриная грудка', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { name: 'Говядина', calories: 250, protein: 26, fat: 17, carbs: 0 },
    { name: 'Яйцо', calories: 155, protein: 13, fat: 11, carbs: 1 },
    { name: 'Рис вареный', calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
    { name: 'Гречка вареная', calories: 110, protein: 4, fat: 1, carbs: 21 },
    { name: 'Овсянка', calories: 68, protein: 2.4, fat: 1.4, carbs: 12 },
    { name: 'Хлеб ржаной', calories: 259, protein: 6.6, fat: 3.3, carbs: 49 },
    { name: 'Молоко 2.5%', calories: 52, protein: 2.8, fat: 2.5, carbs: 4.7 },
    { name: 'Кефир 1%', calories: 40, protein: 3.6, fat: 1, carbs: 4 },
    { name: 'Творог 5%', calories: 121, protein: 17, fat: 5, carbs: 2 },
    { name: 'Сыр российский', calories: 363, protein: 23, fat: 30, carbs: 0 },
    { name: 'Сметана 15%', calories: 158, protein: 3, fat: 15, carbs: 3.4 },
    { name: 'Йогурт 2.5%', calories: 53, protein: 3.5, fat: 2.5, carbs: 3.5 },
    { name: 'Масло сливочное', calories: 748, protein: 0.5, fat: 82, carbs: 0.5 },
    { name: 'Масло подсолнечное', calories: 899, protein: 0, fat: 99.9, carbs: 0 },
    { name: 'Картофель вареный', calories: 82, protein: 2, fat: 0.1, carbs: 17 },
    { name: 'Макароны вареные', calories: 138, protein: 5.2, fat: 0.5, carbs: 28 },
    { name: 'Хлеб белый', calories: 265, protein: 8.1, fat: 3.2, carbs: 49 },
    { name: 'Бананы', calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    { name: 'Яблоко', calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
    { name: 'Апельсин', calories: 47, protein: 0.9, fat: 0.2, carbs: 12 },
    { name: 'Огурец', calories: 15, protein: 0.7, fat: 0.1, carbs: 3 },
    { name: 'Помидор', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
    { name: 'Морковь', calories: 41, protein: 0.9, fat: 0.2, carbs: 10 },
    { name: 'Капуста белокочанная', calories: 27, protein: 1.8, fat: 0.1, carbs: 6.8 },
    { name: 'Лук репчатый', calories: 40, protein: 1.4, fat: 0.2, carbs: 8.2 },
    { name: 'Лосось', calories: 208, protein: 20, fat: 13, carbs: 0 },
    { name: 'Тунец', calories: 96, protein: 21.5, fat: 0.7, carbs: 0 },
    { name: 'Треска', calories: 82, protein: 18, fat: 0.7, carbs: 0 },
    { name: 'Грецкие орехи', calories: 654, protein: 15, fat: 65, carbs: 14 },
    { name: 'Арахис', calories: 567, protein: 26, fat: 49, carbs: 16 },
    { name: 'Мед', calories: 304, protein: 0.3, fat: 0, carbs: 82 },
    { name: 'Сахар', calories: 387, protein: 0, fat: 0, carbs: 100 },
    { name: 'Шоколад темный', calories: 546, protein: 5, fat: 35, carbs: 60 },
    { name: 'Гречневая крупа сухая', calories: 343, protein: 13, fat: 3.4, carbs: 68 },
    { name: 'Рис сухой', calories: 344, protein: 6.5, fat: 1, carbs: 79 },
    { name: 'Творог 0%', calories: 71, protein: 18, fat: 0.6, carbs: 1.8 },
    { name: 'Куриное бедро', calories: 215, protein: 21, fat: 14, carbs: 0 },
    { name: 'Индейка', calories: 189, protein: 29, fat: 7, carbs: 0 },
    { name: 'Свинина нежирная', calories: 213, protein: 26, fat: 12, carbs: 0 }
];

function calcTotals(products) {
    return products.reduce(
        (acc, p) => {
            acc.calories += p.calories;
            acc.protein += p.protein;
            acc.fat += p.fat;
            acc.carbs += p.carbs;
            return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
}

// GET /api/nutrition/entries?date=YYYY-MM-DD
router.get('/entries', auth, async (req, res) => {
    try {
        const dateStr = req.query.date;
        const date = dateStr ? new Date(dateStr) : new Date();
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const entries = await FoodEntry.find({
            user: req.user.id,
            date: { $gte: date, $lt: nextDay }
        });

        const grouped = {};
        for (const entry of entries) {
            const meal = entry.mealType;
            if (!grouped[meal]) {
                grouped[meal] = { mealType: meal, entries: [], totals: { calories: 0, protein: 0, fat: 0, carbs: 0 } };
            }
            const t = calcTotals(entry.products);
            grouped[meal].entries.push(entry);
            grouped[meal].totals.calories += t.calories;
            grouped[meal].totals.protein += t.protein;
            grouped[meal].totals.fat += t.fat;
            grouped[meal].totals.carbs += t.carbs;
        }

        const dailyTotals = Object.values(grouped).reduce(
            (acc, meal) => {
                acc.calories += meal.totals.calories;
                acc.protein += meal.totals.protein;
                acc.fat += meal.totals.fat;
                acc.carbs += meal.totals.carbs;
                return acc;
            },
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        res.json({ date: date.toISOString().split('T')[0], meals: Object.values(grouped), dailyTotals });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /api/nutrition/entries
router.post('/entries', auth, async (req, res) => {
    try {
        const { date, mealType, products } = req.body;

        if (!mealType || !products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Необходимо указать mealType и products' });
        }

        const entryDate = date ? new Date(date) : new Date();
        entryDate.setHours(0, 0, 0, 0);

        const entry = new FoodEntry({
            user: req.user.id,
            date: entryDate,
            mealType,
            products
        });

        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// DELETE /api/nutrition/entries/:id
router.delete('/entries/:id', auth, async (req, res) => {
    try {
        const entry = await FoodEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        if (entry.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав доступа' });
        }
        await entry.deleteOne();
        res.json({ message: 'Запись удалена' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// PATCH /api/nutrition/entries/:id/products - Add a product
router.patch('/entries/:id/products', auth, async (req, res) => {
    try {
        const entry = await FoodEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        if (entry.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав доступа' });
        }

        const { name, portion, calories, protein, fat, carbs } = req.body;
        const missing = [portion, calories, protein, fat, carbs].some(v => v === undefined || v === null);
        if (!name || missing) {
            return res.status(400).json({ message: 'Необходимо указать все поля продукта' });
        }

        entry.products.push({ name, portion, calories, protein, fat, carbs });
        await entry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// DELETE /api/nutrition/entries/:id/products/:productId - Remove a product
router.delete('/entries/:id/products/:productId', auth, async (req, res) => {
    try {
        const entry = await FoodEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        if (entry.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав доступа' });
        }

        const product = entry.products.id(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        entry.products.pull(req.params.productId);
        await entry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/nutrition/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/summary', auth, async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: 'Необходимо указать start и end даты' });
        }

        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const entries = await FoodEntry.find({
            user: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        });

        const byDate = {};
        for (const entry of entries) {
            const key = entry.date.toISOString().split('T')[0];
            if (!byDate[key]) {
                byDate[key] = { date: key, calories: 0, protein: 0, fat: 0, carbs: 0 };
            }
            const t = calcTotals(entry.products);
            byDate[key].calories += t.calories;
            byDate[key].protein += t.protein;
            byDate[key].fat += t.fat;
            byDate[key].carbs += t.carbs;
        }

        const summary = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
        res.json(summary);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/nutrition/foods/search?q=query
router.get('/foods/search', auth, async (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        if (!q) {
            return res.json(FOODS);
        }
        const results = FOODS.filter(f => f.name.toLowerCase().includes(q));
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
