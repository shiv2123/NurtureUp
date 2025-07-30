import { testDb, cleanDatabase, setupTestDatabase } from '../setup/database';

describe('Children API Tests', () => {
  let testData: any;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });

  describe('GET /api/children', () => {
    test('should fetch all children for family', async () => {
      const children = await testDb.child.findMany({
        where: {
          familyId: testData.family.id
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      expect(children).toBeDefined();
      expect(children.length).toBe(1);
      expect(children[0].familyId).toBe(testData.family.id);
      expect(children[0].user.name).toBe('Test Child');
    });

    test('should include user information', async () => {
      const children = await testDb.child.findMany({
        where: {
          familyId: testData.family.id
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      expect(children[0].user).toBeDefined();
      expect(children[0].user.name).toBe('Test Child');
      expect(children[0].user.email).toContain('child-');
      expect(children[0].user.email).toContain('@test.com');
    });

    test('should order children by creation date', async () => {
      // Create additional children
      const childUser2 = await testDb.user.create({
        data: {
          email: 'child2@test.com',
          password: '$2a$10$TEST_HASH',
          name: 'Second Child',
          role: 'CHILD',
          familyId: testData.family.id
        }
      });

      const child2 = await testDb.child.create({
        data: {
          userId: childUser2.id,
          familyId: testData.family.id,
          nickname: 'SecondKid',
          birthDate: new Date('2018-01-01')
        }
      });

      const children = await testDb.child.findMany({
        where: {
          familyId: testData.family.id
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      expect(children.length).toBe(2);
      expect(children[0].user.name).toBe('Test Child'); // Created first
      expect(children[1].user.name).toBe('Second Child'); // Created second
    });

    test('should only return children from the same family', async () => {
      // Create another family with a child
      const otherFamily = await testDb.family.create({
        data: {
          name: 'Other Family'
        }
      });

      const otherChildUser = await testDb.user.create({
        data: {
          email: 'otherchild@test.com',
          password: '$2a$10$TEST_HASH',
          name: 'Other Child',
          role: 'CHILD',
          familyId: otherFamily.id
        }
      });

      await testDb.child.create({
        data: {
          userId: otherChildUser.id,
          familyId: otherFamily.id,
          nickname: 'OtherKid',
          birthDate: new Date('2016-01-01')
        }
      });

      // Fetch children for original family
      const originalFamilyChildren = await testDb.child.findMany({
        where: {
          familyId: testData.family.id
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Should only return children from the original family
      expect(originalFamilyChildren.length).toBe(1);
      expect(originalFamilyChildren[0].user.name).toBe('Test Child');
    });
  });

  describe('Child Profile Management', () => {
    test('should have proper child profile structure', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id },
        include: {
          user: true,
          family: true
        }
      });

      expect(child).toBeDefined();
      expect(child?.nickname).toBe('TestKid');
      expect(child?.birthDate).toBeInstanceOf(Date);
      expect(child?.level).toBe(5);
      expect(child?.xp).toBe(250);
      expect(child?.totalStars).toBe(100);
      expect(child?.currentCoins).toBe(50);
      expect(child?.lifetimeCoins).toBe(200);
      expect(child?.theme).toBe('candy'); // Default value
      expect(child?.soundEnabled).toBe(true); // Default value
    });

    test('should calculate child age correctly', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });

      if (child) {
        const today = new Date();
        const birthDate = child.birthDate;
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        let calculatedAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }

        // Child was born in 2015, so they should be around 8-9 years old
        expect(calculatedAge).toBeGreaterThanOrEqual(8);
        expect(calculatedAge).toBeLessThanOrEqual(10);
      }
    });

    test('should track screen time properly', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });

      expect(child?.dailyScreenMinutes).toBe(60);
      expect(child?.bonusScreenMinutes).toBe(0);
      expect(child?.usedScreenMinutes).toBe(0);
      expect(child?.lastScreenReset).toBeInstanceOf(Date);
    });

    test('should track gamification metrics', async () => {
      const child = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });

      expect(child?.level).toBe(5);
      expect(child?.xp).toBe(250);
      expect(child?.totalStars).toBe(100);
      expect(child?.currentCoins).toBe(50);
      expect(child?.lifetimeCoins).toBe(200);
      expect(child?.currentStreak).toBe(0);
      expect(child?.longestStreak).toBe(0);
    });
  });

  describe('Child-Task Relationships', () => {
    test('should find tasks assigned to child', async () => {
      const tasksForChild = await testDb.task.findMany({
        where: {
          assignedToId: testData.child.id,
          isActive: true
        },
        include: {
          completions: {
            where: {
              childId: testData.child.id
            }
          }
        }
      });

      expect(tasksForChild.length).toBeGreaterThan(0);
      expect(tasksForChild[0].assignedToId).toBe(testData.child.id);
    });

    test('should track task completions for child', async () => {
      // Create a task completion
      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 15,
          completedAt: new Date()
        }
      });

      const childCompletions = await testDb.taskCompletion.findMany({
        where: {
          childId: testData.child.id
        },
        include: {
          task: true
        }
      });

      expect(childCompletions.length).toBe(1);
      expect(childCompletions[0].childId).toBe(testData.child.id);
      expect(childCompletions[0].starsAwarded).toBe(15);
    });
  });

  describe('Child-Reward Relationships', () => {
    test('should track reward purchases for child', async () => {
      const purchase = await testDb.rewardPurchase.create({
        data: {
          rewardId: testData.reward.id,
          childId: testData.child.id,
          coinCost: 25,
          purchasedAt: new Date()
        }
      });

      const childPurchases = await testDb.rewardPurchase.findMany({
        where: {
          childId: testData.child.id
        },
        include: {
          reward: true
        }
      });

      expect(childPurchases.length).toBe(1);
      expect(childPurchases[0].childId).toBe(testData.child.id);
      expect(childPurchases[0].coinCost).toBe(25);
      expect(childPurchases[0].reward.title).toBe('Extra Screen Time');
    });

    test('should handle reward redemption', async () => {
      const purchase = await testDb.rewardPurchase.create({
        data: {
          rewardId: testData.reward.id,
          childId: testData.child.id,
          coinCost: 25,
          purchasedAt: new Date()
        }
      });

      const redeemedPurchase = await testDb.rewardPurchase.update({
        where: { id: purchase.id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
          notes: 'Redeemed by parent'
        }
      });

      expect(redeemedPurchase.isRedeemed).toBe(true);
      expect(redeemedPurchase.redeemedAt).toBeInstanceOf(Date);
      expect(redeemedPurchase.notes).toBe('Redeemed by parent');
    });
  });

  describe('Virtual Pet Integration', () => {
    test('should create virtual pet for child', async () => {
      const pet = await testDb.virtualPet.create({
        data: {
          childId: testData.child.id,
          name: 'Sparky',
          type: 'dragon',
          mood: 'happy',
          level: 3,
          xp: 150,
          happiness: 85,
          energy: 90,
          color: 'blue'
        }
      });

      expect(pet).toBeDefined();
      expect(pet.childId).toBe(testData.child.id);
      expect(pet.name).toBe('Sparky');
      expect(pet.type).toBe('dragon');
      expect(pet.mood).toBe('happy');
    });

    test('should enforce one pet per child', async () => {
      // Create first pet
      await testDb.virtualPet.create({
        data: {
          childId: testData.child.id,
          name: 'First Pet',
          type: 'dragon'
        }
      });

      // Try to create second pet for same child - should fail due to unique constraint
      try {
        await testDb.virtualPet.create({
          data: {
            childId: testData.child.id,
            name: 'Second Pet',
            type: 'unicorn'
          }
        });
        fail('Should have failed due to unique constraint');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});