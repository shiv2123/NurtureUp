import { testDb, cleanDatabase, setupTestDatabase } from '../setup/database';

describe('Rewards API Tests', () => {
  let testData: any;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });

  describe('Reward Management', () => {
    test('should create new reward', async () => {
      const rewardData = {
        familyId: testData.family.id,
        title: 'Movie Night',
        description: 'Choose a family movie for tonight',
        category: 'experience',
        coinCost: 100,
        isActive: true,
        requiresApproval: true
      };

      const reward = await testDb.reward.create({
        data: rewardData
      });

      expect(reward).toBeDefined();
      expect(reward.title).toBe('Movie Night');
      expect(reward.coinCost).toBe(100);
      expect(reward.category).toBe('experience');
      expect(reward.isActive).toBe(true);
      expect(reward.requiresApproval).toBe(true);
    });

    test('should fetch active rewards for family', async () => {
      // Create additional rewards
      await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Ice Cream Trip',
          category: 'experience',
          coinCost: 50,
          isActive: true
        }
      });

      await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Inactive Reward',
          category: 'item',
          coinCost: 25,
          isActive: false
        }
      });

      const activeRewards = await testDb.reward.findMany({
        where: {
          familyId: testData.family.id,
          isActive: true
        },
        orderBy: { coinCost: 'asc' }
      });

      expect(activeRewards.length).toBe(2); // Original + Ice Cream Trip (excludes inactive)
      expect(activeRewards[0].title).toBe('Extra Screen Time'); // 25 coins
      expect(activeRewards[1].title).toBe('Ice Cream Trip'); // 50 coins
    });

    test('should handle reward categories', async () => {
      const categories = ['experience', 'item', 'privilege', 'screentime'];
      
      for (const category of categories) {
        const reward = await testDb.reward.create({
          data: {
            familyId: testData.family.id,
            title: `${category} Reward`,
            category: category,
            coinCost: 30
          }
        });

        expect(reward.category).toBe(category);
      }

      const rewards = await testDb.reward.findMany({
        where: { familyId: testData.family.id }
      });

      const rewardCategories = rewards.map(r => r.category);
      expect(rewardCategories).toContain('experience');
      expect(rewardCategories).toContain('item');
      expect(rewardCategories).toContain('privilege');
      expect(rewardCategories).toContain('screentime');
    });

    test('should handle reward quantity limits', async () => {
      const limitedReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Limited Edition Toy',
          category: 'item',
          coinCost: 200,
          quantity: 1,
          isActive: true
        }
      });

      expect(limitedReward.quantity).toBe(1);

      const unlimitedReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Unlimited Reward',
          category: 'privilege',
          coinCost: 10,
          quantity: null, // Unlimited
          isActive: true
        }
      });

      expect(unlimitedReward.quantity).toBeNull();
    });

    test('should handle age restrictions', async () => {
      const ageRestrictedReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Teen Movie Night',
          category: 'experience',
          coinCost: 75,
          minAge: 13,
          maxAge: 18
        }
      });

      expect(ageRestrictedReward.minAge).toBe(13);
      expect(ageRestrictedReward.maxAge).toBe(18);

      const allAgesReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'All Ages Fun',
          category: 'experience',
          coinCost: 50,
          minAge: null,
          maxAge: null
        }
      });

      expect(allAgesReward.minAge).toBeNull();
      expect(allAgesReward.maxAge).toBeNull();
    });
  });

  describe('Reward Purchases', () => {
    test('should create reward purchase', async () => {
      const purchase = await testDb.rewardPurchase.create({
        data: {
          rewardId: testData.reward.id,
          childId: testData.child.id,
          coinCost: testData.reward.coinCost,
          purchasedAt: new Date()
        }
      });

      expect(purchase).toBeDefined();
      expect(purchase.rewardId).toBe(testData.reward.id);
      expect(purchase.childId).toBe(testData.child.id);
      expect(purchase.coinCost).toBe(25);
      expect(purchase.isRedeemed).toBe(false); // Default value
    });

    test('should track purchase history for child', async () => {
      // Create multiple purchases
      const purchases = await Promise.all([
        testDb.rewardPurchase.create({
          data: {
            rewardId: testData.reward.id,
            childId: testData.child.id,
            coinCost: 25,
            purchasedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
          }
        }),
        testDb.rewardPurchase.create({
          data: {
            rewardId: testData.reward.id,
            childId: testData.child.id,
            coinCost: 25,
            purchasedAt: new Date() // Today
          }
        })
      ]);

      const childPurchases = await testDb.rewardPurchase.findMany({
        where: { childId: testData.child.id },
        include: { reward: true },
        orderBy: { purchasedAt: 'desc' }
      });

      expect(childPurchases.length).toBe(2);
      expect(childPurchases[0].purchasedAt.getTime()).toBeGreaterThan(
        childPurchases[1].purchasedAt.getTime()
      );
    });

    test('should handle reward redemption process', async () => {
      const purchase = await testDb.rewardPurchase.create({
        data: {
          rewardId: testData.reward.id,
          childId: testData.child.id,
          coinCost: 25,
          purchasedAt: new Date()
        }
      });

      expect(purchase.isRedeemed).toBe(false);
      expect(purchase.redeemedAt).toBeNull();

      // Redeem the purchase
      const redeemedPurchase = await testDb.rewardPurchase.update({
        where: { id: purchase.id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
          notes: 'Redeemed during bedtime routine'
        }
      });

      expect(redeemedPurchase.isRedeemed).toBe(true);
      expect(redeemedPurchase.redeemedAt).toBeInstanceOf(Date);
      expect(redeemedPurchase.notes).toBe('Redeemed during bedtime routine');
    });

    test('should calculate total spending for child', async () => {
      // Create multiple purchases with different costs
      await Promise.all([
        testDb.rewardPurchase.create({
          data: {
            rewardId: testData.reward.id,
            childId: testData.child.id,
            coinCost: 25
          }
        }),
        testDb.rewardPurchase.create({
          data: {
            rewardId: testData.reward.id,
            childId: testData.child.id,
            coinCost: 50
          }
        }),
        testDb.rewardPurchase.create({
          data: {
            rewardId: testData.reward.id,
            childId: testData.child.id,
            coinCost: 30
          }
        })
      ]);

      const purchases = await testDb.rewardPurchase.findMany({
        where: { childId: testData.child.id }
      });

      const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.coinCost, 0);
      expect(totalSpent).toBe(105);
    });
  });

  describe('Reward Marketplace Logic', () => {
    test('should check if child can afford reward', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });

      const affordableReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Affordable Treat',
          coinCost: 30, // Child has 50 coins
          category: 'item'
        }
      });

      const expensiveReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Expensive Item',
          coinCost: 100, // Child has 50 coins
          category: 'item'
        }
      });

      expect(child?.currentCoins).toBe(50);
      expect(child?.currentCoins).toBeGreaterThanOrEqual(affordableReward.coinCost);
      expect(child?.currentCoins).toBeLessThan(expensiveReward.coinCost);
    });

    test('should check age eligibility for rewards', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });

      // Calculate child's age (born in 2015, so around 8-9 years old)
      const today = new Date();
      const birthDate = child?.birthDate || new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      const kidsFriendlyReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Kids Movie',
          coinCost: 40,
          category: 'experience',
          minAge: 5,
          maxAge: 12
        }
      });

      const teenReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Teen Activity',
          coinCost: 60,
          category: 'experience',
          minAge: 13,
          maxAge: 18
        }
      });

      // Child should be eligible for kids' reward but not teen reward
      expect(age).toBeGreaterThanOrEqual(kidsFriendlyReward.minAge!);
      expect(age).toBeLessThanOrEqual(kidsFriendlyReward.maxAge!);
      expect(age).toBeLessThan(teenReward.minAge!);
    });

    test('should handle reward expiration', async () => {
      const expiredReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Expired Offer',
          coinCost: 20,
          category: 'item',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          isActive: true
        }
      });

      const validReward = await testDb.reward.create({
        data: {
          familyId: testData.family.id,
          title: 'Valid Offer',
          coinCost: 20,
          category: 'item',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          isActive: true
        }
      });

      const now = new Date();
      
      expect(expiredReward.expiresAt!.getTime()).toBeLessThan(now.getTime());
      expect(validReward.expiresAt!.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('Family Reward Isolation', () => {
    test('should only show rewards from same family', async () => {
      // Create another family with rewards
      const otherFamily = await testDb.family.create({
        data: { name: 'Other Family' }
      });

      await testDb.reward.create({
        data: {
          familyId: otherFamily.id,
          title: 'Other Family Reward',
          coinCost: 25,
          category: 'item'
        }
      });

      // Fetch rewards for original family
      const familyRewards = await testDb.reward.findMany({
        where: { familyId: testData.family.id }
      });

      const rewardTitles = familyRewards.map(r => r.title);
      expect(rewardTitles).toContain('Extra Screen Time');
      expect(rewardTitles).not.toContain('Other Family Reward');
    });
  });
});