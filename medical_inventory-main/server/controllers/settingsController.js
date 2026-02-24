const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (settings) {
            const updatedSettings = await Settings.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true }
            );
            res.json(updatedSettings);
        } else {
            const newSettings = new Settings(req.body);
            await newSettings.save();
            res.json(newSettings);
        }
    } catch (error) {
        res.status(400).json({ message: "Invalid data" });
    }
};

module.exports = { getSettings, updateSettings };
