import expressAsyncHandler from 'express-async-handler';
import { Report } from '../models/reportModel.js';

// @desc make Report
// @route POST /api/report
// @access Private User
export const makeReport = expressAsyncHandler(async (req, res) => {
  const { reporterId, type, targetId, reason, extraInfo } = req.body;

  const existing = await Report.findOne({ type, targetId });

  if (existing) {
    const alreadyReported = existing.reasons.some(r => r.reporterId.toString() === reporterId);
    if (alreadyReported) return res.status(409).json({ message: 'You already reported this item.' });

    existing.reasons.push({ reporterId, reason, extraInfo });
    existing.count += 1;
    await existing.save();
    return res.status(200).json({ message: 'Your report has been added.' });
  }

  const newReport = new Report({
    type,
    targetId,
    reasons: [{ reporterId, reason, extraInfo }],
    count: 1
  });

  await newReport.save();
  res.status(201).json({ message: 'Reported' });
});
