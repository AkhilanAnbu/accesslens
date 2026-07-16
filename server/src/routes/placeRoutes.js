import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  ACCESSIBILITY_FEATURES,
  PLACE_CATEGORIES,
  VERIFICATION_STATUSES
} from "../utils/constants.js";
import { serializeDocument, serializeDocuments } from "../utils/serializers.js";
import {
  cleanMultiline,
  cleanStringArray,
  cleanText,
  escapeRegex,
  parseObjectId,
  parsePagination
} from "../utils/validation.js";

function normalizePlaceInput(body) {
  return {
    name: cleanText(body.name, 120),
    category: cleanText(body.category, 60),
    address: {
      street: cleanText(body.address?.street, 140),
      city: cleanText(body.address?.city, 80),
      state: cleanText(body.address?.state, 80),
      postalCode: cleanText(body.address?.postalCode, 20)
    },
    accessibilityFeatures: cleanStringArray(body.accessibilityFeatures, ACCESSIBILITY_FEATURES),
    description: cleanMultiline(body.description, 1500),
    contact: {
      phone: cleanText(body.contact?.phone, 40),
      website: cleanText(body.contact?.website, 240)
    },
    verificationStatus: cleanText(body.verificationStatus, 30)
  };
}

function validatePlace(place) {
  if (place.name.length < 2) {
    return "Place name must contain at least two characters.";
  }
  if (!PLACE_CATEGORIES.includes(place.category)) {
    return "Choose a valid place category.";
  }
  if (!place.address.city) {
    return "City is required.";
  }
  if (!VERIFICATION_STATUSES.includes(place.verificationStatus)) {
    return "Choose a valid verification status.";
  }
  return null;
}

export function createPlaceRouter(db) {
  const router = Router();
  const places = db.collection("places");

  router.get("/", async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      const search = cleanText(req.query.search, 100);
      const location = cleanText(req.query.location, 80);
      const category = cleanText(req.query.category, 60);
      const feature = cleanText(req.query.feature, 80);
      const verificationStatus = cleanText(req.query.verificationStatus, 30);
      const sort = cleanText(req.query.sort, 30);
      const mine = req.query.mine === "true";

      if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        filter.$or = [
          { name: regex },
          { description: regex },
          { "address.city": regex },
          { "address.street": regex }
        ];
      }
      if (location) {
        const regex = new RegExp(escapeRegex(location), "i");
        filter.$and = [
          ...(filter.$and || []),
          { $or: [{ "address.city": regex }, { "address.state": regex }] }
        ];
      }
      if (category && PLACE_CATEGORIES.includes(category)) {
        filter.category = category;
      }
      if (feature && ACCESSIBILITY_FEATURES.includes(feature)) {
        filter.accessibilityFeatures = feature;
      }
      if (verificationStatus && VERIFICATION_STATUSES.includes(verificationStatus)) {
        filter.verificationStatus = verificationStatus;
      }
      if (mine) {
        if (!req.user) {
          res.status(401).json({ error: "Please sign in to view your places." });
          return;
        }
        filter.createdBy = req.user._id;
      }

      const sortOptions = {
        updated: { updatedAt: -1 },
        nameAsc: { name: 1 },
        nameDesc: { name: -1 }
      };
      const selectedSort = sortOptions[sort] || sortOptions.updated;

      const [items, total] = await Promise.all([
        places.find(filter).sort(selectedSort).skip(skip).limit(limit).toArray(),
        places.countDocuments(filter)
      ]);

      res.json({
        items: serializeDocuments(items),
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(Math.ceil(total / limit), 1)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/meta/options", (_req, res) => {
    res.json({
      categories: PLACE_CATEGORIES,
      accessibilityFeatures: ACCESSIBILITY_FEATURES,
      verificationStatuses: VERIFICATION_STATUSES
    });
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const placeId = parseObjectId(req.params.id);
      if (!placeId) {
        res.status(400).json({ error: "Invalid place identifier." });
        return;
      }

      const [place] = await places
        .aggregate([
          { $match: { _id: placeId } },
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "creator"
            }
          },
          { $set: { creator: { $first: "$creator" } } },
          { $project: { "creator.passwordHash": 0, "creator.email": 0 } }
        ])
        .toArray();

      if (!place) {
        res.status(404).json({ error: "Place not found." });
        return;
      }

      res.json({ place: serializeDocument(place) });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const place = normalizePlaceInput(req.body);
      const validationError = validatePlace(place);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const now = new Date();
      const document = {
        ...place,
        createdBy: req.user._id,
        createdAt: now,
        updatedAt: now
      };
      const result = await places.insertOne(document);
      document._id = result.insertedId;
      res.status(201).json({ place: serializeDocument(document) });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const placeId = parseObjectId(req.params.id);
      if (!placeId) {
        res.status(400).json({ error: "Invalid place identifier." });
        return;
      }

      const existing = await places.findOne({ _id: placeId });
      if (!existing) {
        res.status(404).json({ error: "Place not found." });
        return;
      }
      if (!existing.createdBy.equals(req.user._id)) {
        res.status(403).json({ error: "Only the listing creator can edit this place." });
        return;
      }

      const place = normalizePlaceInput(req.body);
      const validationError = validatePlace(place);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const updatedAt = new Date();
      await places.updateOne({ _id: placeId }, { $set: { ...place, updatedAt } });
      res.json({ place: serializeDocument({ ...existing, ...place, updatedAt }) });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      const placeId = parseObjectId(req.params.id);
      if (!placeId) {
        res.status(400).json({ error: "Invalid place identifier." });
        return;
      }

      const existing = await places.findOne({ _id: placeId });
      if (!existing) {
        res.status(404).json({ error: "Place not found." });
        return;
      }
      if (!existing.createdBy.equals(req.user._id)) {
        res.status(403).json({ error: "Only the listing creator can delete this place." });
        return;
      }

      await places.deleteOne({ _id: placeId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
