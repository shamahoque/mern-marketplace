import { addToWatchlist } from "../api/watchlist";

const handleWatchlist = async () => {
  await addToWatchlist(product._id, user.token);
};

<button onClick={handleWatchlist} className="watchlist-btn">
  ❤️
</button>
