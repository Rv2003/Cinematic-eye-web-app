
import TeamMember from "../models/members.model.js";
import cloudinary from "../config/cloudinary.js";

const memberFields = ["name", "role", "photo", "instagram"];

const uploadPhoto = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "cinematic-eye/members" }, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Photo upload returned no result"));
        resolve(result.secure_url);
      })
      .end(buffer);
  });

export const addMember = async (req, res, next) => {
  try {
    const member = await TeamMember.create({
      name: req.body.name,
      role: req.body.role,
      photo: req.file ? await uploadPhoto(req.file.buffer) : req.body.photo,
      instagram: req.body.instagram,
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const updates = Object.fromEntries(
      memberFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );

    if (req.file) updates.photo = await uploadPhoto(req.file.buffer);

    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!member) {
      const error = new Error("Team member not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);

    if (!member) {
      const error = new Error("Team member not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};