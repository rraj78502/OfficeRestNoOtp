const asyncHandler = require("../utils/asyncHandler");
const Event = require("../model/eventModel");
const {validateUploadedFiles} = require("../utils/valiadateFiles");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadFileWithFolderLogic, deleteFileFromStorage } = require("../helper/storageHelper");
const mongoose = require("mongoose");


  // Create event (Admin only)
  const createEventContoller = asyncHandler(async (req, res) => {
    const { title, description, date, time,location } = req.body;

    // Validate input
    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }

    // Check for existing event
    const existingEvent = await Event.findOne({ title });
    if (existingEvent) {
      throw new ApiError(400, "Event already exists");
    }

    // Validate file uploads
    validateUploadedFiles(req.files);

    // Upload files to local storage
    const files = [];
    for (const file of req.files) {
      try {
        const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Event Files");
        files.push({
          url: result.url,
          type: file.mimetype,
        });
      } catch (error) {
        console.error(`Failed to upload file ${file.path}:`, error.message);
      }
    }

    if (files.length === 0) {
      throw new ApiError(400, "Failed to upload any files");
    }

    // Debug log for files array before saving
    console.log("Files array before saving:", files);

    // Create event
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      files,
    });

    const createdEvent = await Event.findById(event._id);

    return res
      .status(201)
      .json(new ApiResponse(201, createdEvent, "Event created successfully"));
  });

  // Get all events
  const getAllEventController = asyncHandler(async (req, res) => {
    const events = await Event.find({}).sort({ createdAt: -1 });

    if (!events.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No events found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, events, "All events fetched successfully"));
  });

  // Get single event by ID
  const getEventController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event fetched successfully"));
  });

  // Update event (Admin only)
  const updateEventController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, location,time, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid event ID");
    }

    if (!title && !description && !date && !location && (!req.files || req.files.length === 0)) {
      throw new ApiError(400, "At least one field must be provided for update");
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (time) event.time=time;

    // Validate and upload files if provided
    if (req.files && req.files.length > 0) {
      validateUploadedFiles(req.files);
      const newFiles = [];
      for (const file of req.files) {
        try {
          const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Event Files");
          newFiles.push({
            url: result.url,
            type: file.mimetype,
          });
        } catch (error) {
          console.error(`Failed to upload file ${file.path}:`, error.message);
        }
      }

      if (newFiles.length > 0) {
        event.files = [...event.files, ...newFiles]; // Append new files instead of replacing
      }
    }

    // Debug log for event before saving
    console.log("Event before saving:", event);

    await event.save();

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event updated successfully"));
  });

  /// Delete event (Admin only)
  const deleteEventController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Delete files from local storage
    const deletionErrors = [];
    for (const file of event.files) {
      try {
        await deleteFileFromStorage(file.url);
      } catch (error) {
        console.error(`Failed to delete file ${file.url}:`, error.message);
        deletionErrors.push(`Failed to delete ${file.url}: ${error.message}`);
      }
    }

    if (deletionErrors.length > 0) {
      throw new ApiError(500, `Some files could not be deleted: ${deletionErrors.join('; ')}`);
    }

    await Event.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Event deleted successfully"));
  });

  // Delete specific file from event (Admin only)
  const deleteEventFileController = asyncHandler(async (req, res) => {
    const { id, fileUrl } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const decodedFileUrl = decodeURIComponent(fileUrl || "");
    const fileIndex = event.files.findIndex((file) => file.url === decodedFileUrl);
    if (fileIndex === -1) {
      throw new ApiError(404, "File not found in event");
    }

    const file = event.files[fileIndex];
    try {
      await deleteFileFromStorage(file.url);
    } catch (error) {
      console.error(`Failed to delete file ${file.url}:`, error.message);
      throw new ApiError(500, `Failed to delete ${file.url}: ${error.message}`);
    }

    // Remove file from event
    event.files.splice(fileIndex, 1);
    await event.save();

    return res
      .status(200)
      .json(new ApiResponse(200, event, "File deleted successfully"));
  });

  module.exports = {
    createEventContoller,
    getAllEventController,
    getEventController,
    updateEventController,
    deleteEventController,
    deleteEventFileController,
  };
