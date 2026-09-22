import User from "../models/user.js";
import CreditLedger from "../models/creditLedger.js";

/**
 * GET /api/credits/my-ledger
 * Get logged-in user's credit balance and transaction history
 */
export const getMyCreditLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("credits");

    const ledger = await CreditLedger.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate("sender", "name firstName lastName email")
      .populate("receiver", "name firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedHistory = ledger.map(entry => {
      const isSender = entry.sender?._id?.toString() === req.user._id.toString();
      return {
        id: entry._id,
        displayId: `#TX-${entry._id.toString().slice(-6).toUpperCase()}`,
        type: isSender ? 'spent' : 'earned',
        amount: isSender ? `-${entry.amount}` : `+${entry.amount}`,
        partnerName: isSender
          ? (entry.receiver?.name || entry.receiver?.firstName || 'Community Member')
          : (entry.sender?.name || entry.sender?.firstName || 'Community Member'),
        description: entry.description || (isSender ? 'Skill Swap Class' : 'Skill Teaching Earned'),
        date: new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        credits: user?.credits ?? 3,
        history: formattedHistory
      }
    });
  } catch (error) {
    next(error);
  }
};
