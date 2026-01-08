const asyncHandler = require("../utils/asyncHandler");
const Setting = require("../model/settingModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Get all settings
const getSettings = asyncHandler(async (req, res) => {
    const settings = await Setting.find({});

    // Transform array to object for easier frontend consumption { key: value }
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.key] = s.value;
    });

    return res
        .status(200)
        .json(new ApiResponse(200, settingsObj, "Settings retrieved successfully"));
});

// Update a specific setting
const updateSetting = asyncHandler(async (req, res) => {
    const { key, value } = req.body;

    if (!key) {
        throw new ApiError(400, "Setting key is required");
    }

    const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, setting, "Setting updated successfully"));
});

// Seed default settings if not compatible
const seedSettings = async () => {
    const defaults = [
        { key: "curtainAnimationEnabled", value: true, description: "Enable/Disable inauguration animation" },
        { key: "curtainAnimationMessage", value: "Welcome to REST!", description: "Message shown during animation" }
    ];

    for (const d of defaults) {
        const exists = await Setting.findOne({ key: d.key });
        if (!exists) {
            await Setting.create(d);
            console.log(`Seeded setting: ${d.key}`);
        }
    }
};

module.exports = {
    getSettings,
    updateSetting,
    seedSettings
};
