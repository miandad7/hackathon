const Complaint = require('../models/Complaint');
const Anthropic = require('@anthropic-ai/sdk');

// @desc    Generate AI officer operational summary
// @route   POST /api/ai/officer-summary
// @access  Officer
const getOfficerSummary = async (req, res, next) => {
  try {
    const allComplaints = await Complaint.find().exec();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalComplaints = allComplaints.length;
    const newToday = allComplaints.filter((c) => new Date(c.createdAt) >= startOfToday).length;
    const overdueUnresolved = allComplaints.filter(
      (c) => c.status !== 'resolved' && new Date(c.createdAt) < threeDaysAgo
    ).length;
    const resolvedThisWeek = allComplaints.filter(
      (c) => c.status === 'resolved' && new Date(c.updatedAt) >= sevenDaysAgo
    ).length;

    // Count by Category
    const categoryCounts = {};
    allComplaints.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    // Count by Area
    const areaCounts = {};
    allComplaints.forEach((c) => {
      areaCounts[c.area] = (areaCounts[c.area] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const hotspotAreas = Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const stats = {
      totalComplaints,
      newToday,
      overdueUnresolved,
      resolvedThisWeek,
      topCategories,
      hotspotAreas
    };

    let summaryText = '';

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const anthropic = new Anthropic({ apiKey });
        const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

        const promptMessage = `Complaint Statistics JSON:
${JSON.stringify(stats, null, 2)}`;

        const response = await anthropic.messages.create({
          model: model,
          max_tokens: 300,
          system:
            'You are a concise government operations assistant. Summarize these complaint stats in 3–5 plain English sentences for a busy government officer. Be specific about numbers, categories, and hotspot areas. No markdown.',
          messages: [{ role: 'user', content: promptMessage }]
        });

        if (response.content && response.content[0] && response.content[0].text) {
          summaryText = response.content[0].text.trim();
        }
      } catch (apiErr) {
        console.warn('Anthropic API call failed, falling back to local summary:', apiErr.message);
      }
    }

    // Fallback if ANTHROPIC_API_KEY is unset or failed
    if (!summaryText) {
      const topCatList = topCategories.map((c) => `${c.name} (${c.count})`).join(', ') || 'None';
      const hotspotList = hotspotAreas.map((a) => `${a.name} (${a.count})`).join(', ') || 'None';

      summaryText = `Operational Briefing: A total of ${totalComplaints} complaints are logged in the system. Today saw ${newToday} new reports, while ${overdueUnresolved} issues remain unresolved past the 3-day threshold. Over the last week, ${resolvedThisWeek} complaints were successfully resolved. The highest volume categories are ${topCatList}, with major hotspot activity recorded in ${hotspotList}.`;
    }

    res.status(200).json({
      summary: summaryText,
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfficerSummary
};
