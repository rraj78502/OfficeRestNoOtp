import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Settings() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        curtainAnimationEnabled: false,
        curtainAnimationMessage: "",
    });

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/settings`, {
                withCredentials: true,
            });
            if (response.data && response.data.data) {
                setSettings({
                    curtainAnimationEnabled: response.data.data.curtainAnimationEnabled === true || response.data.data.curtainAnimationEnabled === "true",
                    curtainAnimationMessage: response.data.data.curtainAnimationMessage || ""
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        const newValue = !settings.curtainAnimationEnabled;
        try {
            await updateSetting("curtainAnimationEnabled", newValue);
            setSettings(prev => ({ ...prev, curtainAnimationEnabled: newValue }));
            toast.success(`Animation ${newValue ? "enabled" : "disabled"}`);
        } catch (error) {
            // Error handled in updateSetting
        }
    };

    const handleMessageChange = (e) => {
        setSettings(prev => ({ ...prev, curtainAnimationMessage: e.target.value }));
    }

    const handleMessageSave = async () => {
        try {
            await updateSetting("curtainAnimationMessage", settings.curtainAnimationMessage);
            toast.success("Animation message updated");
        } catch (error) {
            // Error handled in updateSetting
        }
    }

    const updateSetting = async (key, value) => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/v1/settings`,
                { key, value },
                { withCredentials: true }
            );
        } catch (error) {
            console.error(`Error updating setting ${key}:`, error);
            toast.error("Failed to update setting");
            throw error;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Inauguration Curtain Animation</h2>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="font-medium text-gray-800">Enable Animation</p>
                        <p className="text-sm text-gray-500">
                            When enabled, a curtain animation will play for users on their first visit per session.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.curtainAnimationEnabled}
                            onChange={handleToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="mb-4">
                    <label className="block font-medium text-gray-800 mb-2">Animation Message</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={settings.curtainAnimationMessage}
                            onChange={handleMessageChange}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. Welcome to REST!"
                        />
                        <button
                            onClick={handleMessageSave}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">This text appears when the curtain opens.</p>
                </div>
            </div>
        </div>
    );
}

export default Settings;
