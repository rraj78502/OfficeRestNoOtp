const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed, // Can be String, Boolean, Number, Object, etc.
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;
