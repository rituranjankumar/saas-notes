const User = require("../models/User");

exports.getUsersInTenant = async (req, res) => {
  try {
    const members = await User.find({ tenant: req.user.tenantId });
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate || userToUpdate.tenant.toString() !== req.user.tenantId) {
      return res.status(404).json({ error: "User not found or access denied" });
    }
    userToUpdate.role = role;
    await userToUpdate.save();
    res.json({ user: userToUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.upgradeUserPlan = async (req, res) => {
    const { userId } = req.params;
    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate || userToUpdate.tenant.toString() !== req.user.tenantId) {
            return res.status(404).json({ error: "User not found or access denied" });
        }
        if (userToUpdate.plan === 'pro') {
            return res.status(400).json({ error: "User already on Pro plan" });
        }
        userToUpdate.plan = 'pro';
        await userToUpdate.save();
        res.json({ user: userToUpdate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};