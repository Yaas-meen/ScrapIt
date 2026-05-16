import User from '../models/User.model.js';

// Points awarded per kg for each waste type
export const WASTE_RATES = {
  Plastic: 10,
  Glass: 8,
  Metal: 20,
};

//calculating points to assign to user based on weight
export const calculatePickupPoints = (wasteItems) => {
  let totalPoints = 0;
  let totalWeight = 0;

  const enrichedItems = wasteItems.map((item) => {
    const rate = WASTE_RATES[item.type];

    if (!rate) {
      throw new Error(`Unknown waste type: ${item.type}`);
    }

    const earned = Math.round(item.weight * rate);
    totalPoints += earned;
    totalWeight += item.weight;

    return {
      type: item.type,
      weight: item.weight,
      pointsRate: rate,
      pointsEarned: earned,
    };
  });

  return { enrichedItems, totalPoints, totalWeight };
};

// assigning the points to user after calculation
export const awardPointsToUser = async (userId, points) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        points: points,
        totalPointsEarned: points,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found when awarding points');
  }

  return user;
};

//deducting points after gift card or airtime redemption
export const deductPointsFromUser = async (userId, points) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.points < points) {
    throw new Error(`Insufficient points. You have ${user.points} but need ${points}`);
  }

  user.points -= points;
  user.totalPointsSpent += points;
  await user.save();

  return user;
};