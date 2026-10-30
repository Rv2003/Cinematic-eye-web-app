import Photo from "../models/gallery.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "cinematic-eye/gallery", tags: ["gallery"] }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

// GET /api/v1/gallery?featured=true&category=wedding&page=1&limit=24
export const getPhotos = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 24, 100);

    const filter = {};
    if (category && category !== "all") filter.category = category.toLowerCase();
    if (featured === "true") filter.featured = true;

    const [photos, total, categories] = await Promise.all([
      Photo.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Photo.countDocuments(filter),
      Photo.distinct("category"), // for the filter pills
    ]);

    res.json({ photos, categories, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ message: "Failed to load gallery" });
  }
};

// POST /api/v1/gallery  (admin) — multipart: images[], category, title?, featured?
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "No images uploaded" });
    const { category, title = "", featured = "false" } = req.body;
    if (!category) return res.status(400).json({ message: "Category is required" });

    const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer)));

    const docs = await Photo.insertMany(
      results.map((r) => ({
        title,
        category,
        featured: featured === "true",
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
      }))
    );

    res.status(201).json({ photos: docs });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// PATCH /api/v1/gallery/:id  (admin)
export const updatePhoto = async (req, res) => {
  try {
    const { title, category, featured, order } = req.body;
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { $set: { title, category, featured, order } },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE /api/v1/gallery/:id  (admin)
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};