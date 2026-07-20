import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  PLACE_CATEGORIES,
  REPORT_BARRIER_TYPES,
  REPORT_SEVERITIES,
  REPORT_STATUSES
} from "../utils/constants.js";
import { serializeDocument, serializeDocuments } from "../utils/serializers.js";
import {
  cleanMultiline,
  cleanText,
  escapeRegex,
  parseObjectId,
  parsePagination
} from "../utils/validation.js";

const SEVERITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };

function normalizeReportInput(body) {
  return {
    placeId: cleanText(body.placeId, 40),
    barrierType: cleanText(body.barrierType, 60),
    severity: cleanText(body.severity, 20),
    description: cleanMultiline(body.description, 1500),
    suggestedFix: cleanMultiline(body.suggestedFix, 1000)
  };
}

function validateReport(report) {
  if (!REPORT_BARRIER_TYPES.includes(report.barrierType)) {
    return "Choose a valid barrier type.";
  }
  if (!REPORT_SEVERITIES.includes(report.severity)) {
    return "Choose a valid severity level.";
  }
  if (report.description.length < 10) {
    return "Add a description with at least ten characters.";
  }
  return null;
}

export function createReportRouter(db) {
  const router = Router();
  const reports = db.collection("reports");
  const places = db.collection("places");

  router.get("/", async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const search = cleanText(req.query.search, 100);
      const barrierType = cleanText(req.query.barrierType, 60);
      const severity = cleanText(req.query.severity, 20);
      const status = cleanText(req.query.status, 30);
      const category = cleanText(req.query.category, 60);
      const sort = cleanText(req.query.sort, 30);
      const mine = req.query.mine === "true";

      const reportMatch = {};
      if (barrierType && REPORT_BARRIER_TYPES.includes(barrierType)) {
        reportMatch.barrierType = barrierType;
      }
      if (severity && REPORT_SEVERITIES.includes(severity)) {
        reportMatch.severity = severity;
      }
      if (status && REPORT_STATUSES.includes(status)) {
        reportMatch.status = status;
      }
      if (mine) {
        if (!req.user) {
          res.status(401).json({ error: "Please sign in to view your reports." });
          return;
        }
        reportMatch.createdBy = req.user._id;
      }

      const placeMatch = {};
      if (category && PLACE_CATEGORIES.includes(category)) {
        placeMatch["place.category"] = category;
      }
      if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        placeMatch.$or = [
          { description: regex },
          { suggestedFix: regex },
          { "place.name": regex },
          { "place.address.city": regex }
        ];
      }

      const sortOptions = {
        recent: { createdAt: -1 },
        oldest: { createdAt: 1 },
        severity: { severityRank: -1, createdAt: -1 }
      };
      const selectedSort = sortOptions[sort] || sortOptions.recent;

      const basePipeline = [
        { $match: reportMatch },
        {
          $lookup: {
            from: "places",
            localField: "placeId",
            foreignField: "_id",
            as: "place"
          }
        },
        { $set: { place: { $first: "$place" } } },
        { $match: placeMatch }
      ];

      const [items, countResult] = await Promise.all([
        reports
          .aggregate([
            ...basePipeline,
            {
              $set: {
                severityRank: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$severity", "Low"] }, then: SEVERITY_RANK.Low },
                      { case: { $eq: ["$severity", "Medium"] }, then: SEVERITY_RANK.Medium },
                      { case: { $eq: ["$severity", "High"] }, then: SEVERITY_RANK.High },
                      { case: { $eq: ["$severity", "Critical"] }, then: SEVERITY_RANK.Critical }
                    ],
                    default: 0
                  }
                }
              }
            },
            { $sort: selectedSort },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                severityRank: 0,
                "place.description": 0,
                "place.accessibilityFeatures": 0,
                "place.contact": 0
              }
            }
          ])
          .toArray(),
        reports.aggregate([...basePipeline, { $count: "total" }]).toArray()
      ]);

      const total = countResult[0]?.total || 0;

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

  router.get("/:id", async (req, res, next) => {
    try {
      const reportId = parseObjectId(req.params.id);
      if (!reportId) {
        res.status(400).json({ error: "Invalid report identifier." });
        return;
      }

      const [report] = await reports
        .aggregate([
          { $match: { _id: reportId } },
          {
            $lookup: {
              from: "places",
              localField: "placeId",
              foreignField: "_id",
              as: "place"
            }
          },
          { $set: { place: { $first: "$place" } } },
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

      if (!report) {
        res.status(404).json({ error: "Report not found." });
        return;
      }

      res.json({ report: serializeDocument(report) });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const input = normalizeReportInput(req.body);
      const validationError = validateReport(input);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const placeId = parseObjectId(input.placeId);
      if (!placeId) {
        res.status(400).json({ error: "Select a valid place for this report." });
        return;
      }
      const place = await places.findOne({ _id: placeId });
      if (!place) {
        res.status(404).json({ error: "The selected place does not exist." });
        return;
      }

      const now = new Date();
      const document = {
        placeId,
        barrierType: input.barrierType,
        severity: input.severity,
        description: input.description,
        suggestedFix: input.suggestedFix,
        status: "Open",
        createdBy: req.user._id,
        createdAt: now,
        updatedAt: now
      };
      const result = await reports.insertOne(document);
      document._id = result.insertedId;
      res.status(201).json({ report: serializeDocument(document) });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const reportId = parseObjectId(req.params.id);
      if (!reportId) {
        res.status(400).json({ error: "Invalid report identifier." });
        return;
      }

      const existing = await reports.findOne({ _id: reportId });
      if (!existing) {
        res.status(404).json({ error: "Report not found." });
        return;
      }
      if (!existing.createdBy.equals(req.user._id)) {
        res.status(403).json({ error: "Only the report creator can edit this report." });
        return;
      }

      const input = normalizeReportInput(req.body);
      const validationError = validateReport(input);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const placeId = parseObjectId(input.placeId);
      if (!placeId) {
        res.status(400).json({ error: "Select a valid place for this report." });
        return;
      }
      const place = await places.findOne({ _id: placeId });
      if (!place) {
        res.status(404).json({ error: "The selected place does not exist." });
        return;
      }

      const updatedAt = new Date();
      const changes = {
        placeId,
        barrierType: input.barrierType,
        severity: input.severity,
        description: input.description,
        suggestedFix: input.suggestedFix,
        updatedAt
      };
      await reports.updateOne({ _id: reportId }, { $set: changes });
      res.json({ report: serializeDocument({ ...existing, ...changes }) });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      const reportId = parseObjectId(req.params.id);
      if (!reportId) {
        res.status(400).json({ error: "Invalid report identifier." });
        return;
      }

      const existing = await reports.findOne({ _id: reportId });
      if (!existing) {
        res.status(404).json({ error: "Report not found." });
        return;
      }
      if (!existing.createdBy.equals(req.user._id)) {
        res.status(403).json({ error: "Only the report creator can delete this report." });
        return;
      }

      await reports.deleteOne({ _id: reportId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/status", requireAuth, async (req, res, next) => {
    try {
      const reportId = parseObjectId(req.params.id);
      if (!reportId) {
        res.status(400).json({ error: "Invalid report identifier." });
        return;
      }

      const status = cleanText(req.body.status, 30);
      if (!REPORT_STATUSES.includes(status)) {
        res.status(400).json({ error: "Choose a valid report status." });
        return;
      }

      const report = await reports.findOne({ _id: reportId });
      if (!report) {
        res.status(404).json({ error: "Report not found." });
        return;
      }

      const place = await places.findOne({ _id: report.placeId });
      if (!place) {
        res.status(404).json({ error: "The related place no longer exists." });
        return;
      }
      if (!place.createdBy.equals(req.user._id)) {
        res.status(403).json({ error: "Only the place creator can change report status." });
        return;
      }

      const updatedAt = new Date();
      await reports.updateOne({ _id: reportId }, { $set: { status, updatedAt } });
      res.json({ report: serializeDocument({ ...report, status, updatedAt }) });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
