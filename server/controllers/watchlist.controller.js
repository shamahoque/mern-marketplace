import User from "../models/User.js";

export const addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.watchlist.includes(req.params.productId)) {
      user.watchlist.push(req.params.productId);
      await user.save();
    }

    res.status(200).json({ message: "Added to watchlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== req.params.productId
    );

    await user.save();
    res.status(200).json({ message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("watchlist");
    res.status(200).json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
