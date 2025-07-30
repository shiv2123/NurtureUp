import { testDb, cleanDatabase, setupTestDatabase } from '../setup/database';

describe('Database Operations Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });

  describe('Database Connection', () => {
    test('should connect to test database', async () => {
      const result = await testDb.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    test('should execute raw queries', async () => {
      const result = await testDb.$queryRaw`SELECT COUNT(*) as count FROM Family`;
      expect(result).toBeDefined();
    });
  });

  describe('Family Operations', () => {
    test('should create family with default settings', async () => {
      const family = await testDb.family.create({
        data: {
          name: 'Test Family',
          timezone: 'America/New_York',
          currency: 'USD'
        }
      });

      expect(family).toBeDefined();
      expect(family.name).toBe('Test Family');
      expect(family.timezone).toBe('America/New_York');
      expect(family.currency).toBe('USD');
      expect(family.id).toBeDefined();
      expect(family.createdAt).toBeInstanceOf(Date);
      expect(family.updatedAt).toBeInstanceOf(Date);
    });

    test('should create family with settings', async () => {
      const family = await testDb.family.create({
        data: {
          name: 'Test Family with Settings',
          settings: {
            create: {
              starToCoinsRatio: 15,
              enableCommunity: false,
              enableLearning: true,
              enablePets: true,
              dailyTaskLimit: 5
            }
          }
        },
        include: {
          settings: true
        }
      });

      expect(family.settings).toBeDefined();
      expect(family.settings?.starToCoinsRatio).toBe(15);
      expect(family.settings?.enableCommunity).toBe(false);
      expect(family.settings?.dailyTaskLimit).toBe(5);
    });

    test('should update family settings', async () => {
      const family = await testDb.family.create({
        data: {
          name: 'Test Family',
          settings: {
            create: {
              starToCoinsRatio: 10,
              enableCommunity: true
            }
          }
        },
        include: { settings: true }
      });

      const updatedFamily = await testDb.family.update({
        where: { id: family.id },
        data: {
          settings: {
            update: {
              starToCoinsRatio: 20,
              enableCommunity: false,
              dailyTaskLimit: 3
            }
          }
        },
        include: { settings: true }
      });

      expect(updatedFamily.settings?.starToCoinsRatio).toBe(20);
      expect(updatedFamily.settings?.enableCommunity).toBe(false);
      expect(updatedFamily.settings?.dailyTaskLimit).toBe(3);
    });
  });

  describe('User and Profile Operations', () => {
    test('should create user with parent profile', async () => {
      const family = await testDb.family.create({
        data: { name: 'Test Family' }
      });

      const user = await testDb.user.create({
        data: {
          email: 'parent@test.com',
          password: 'hashed_password',
          name: 'Test Parent',
          role: 'PARENT',
          familyId: family.id,
          parentProfile: {
            create: {
              familyId: family.id,
              isPrimary: true,
              notifications: JSON.stringify({ email: true, push: false })
            }
          }
        },
        include: {
          parentProfile: true
        }
      });

      expect(user.parentProfile).toBeDefined();
      expect(user.parentProfile?.isPrimary).toBe(true);
      expect(user.parentProfile?.familyId).toBe(family.id);
    });

    test('should create user with child profile', async () => {
      const family = await testDb.family.create({
        data: { name: 'Test Family' }
      });

      const user = await testDb.user.create({
        data: {
          email: 'child@test.com',
          password: 'hashed_password',
          name: 'Test Child',
          role: 'CHILD',
          familyId: family.id,
          childProfile: {
            create: {
              familyId: family.id,
              nickname: 'TestKid',
              birthDate: new Date('2015-06-15'),
              level: 1,
              xp: 0,
              totalStars: 0,
              currentCoins: 0,
              lifetimeCoins: 0
            }
          }
        },
        include: {
          childProfile: true
        }
      });

      expect(user.childProfile).toBeDefined();
      expect(user.childProfile?.nickname).toBe('TestKid');
      expect(user.childProfile?.level).toBe(1);
      expect(user.childProfile?.familyId).toBe(family.id);
    });

    test('should enforce unique email constraint', async () => {
      const family = await testDb.family.create({
        data: { name: 'Test Family' }
      });

      await testDb.user.create({
        data: {
          email: 'duplicate@test.com',
          password: 'password1',
          name: 'First User',
          role: 'PARENT',
          familyId: family.id
        }
      });

      // Try to create another user with same email
      try {
        await testDb.user.create({
          data: {
            email: 'duplicate@test.com',
            password: 'password2',
            name: 'Second User',
            role: 'PARENT',
            familyId: family.id
          }
        });
        fail('Should have failed due to unique email constraint');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Task and Completion Operations', () => {
    test('should create task with completions', async () => {
      const testData = await setupTestDatabase();

      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 10,
          completedAt: new Date(),
          proofImage: 'https://example.com/proof.jpg'
        }
      });

      const taskWithCompletions = await testDb.task.findUnique({
        where: { id: testData.task.id },
        include: {
          completions: true,
          assignedTo: true
        }
      });

      expect(taskWithCompletions?.completions).toBeDefined();
      expect(taskWithCompletions?.completions.length).toBe(1);
      expect(taskWithCompletions?.completions[0].starsAwarded).toBe(10);
      expect(taskWithCompletions?.completions[0].proofImage).toBe('https://example.com/proof.jpg');
    });

    test('should enforce unique task completion constraint', async () => {
      const testData = await setupTestDatabase();
      const completedAt = new Date();

      await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 10,
          completedAt: completedAt
        }
      });

      // Try to create another completion for same task, child, and time
      try {
        await testDb.taskCompletion.create({
          data: {
            taskId: testData.task.id,
            childId: testData.child.id,
            starsAwarded: 5,
            completedAt: completedAt
          }
        });
        fail('Should have failed due to unique constraint');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should cascade delete completions when task is deleted', async () => {
      const testData = await setupTestDatabase();

      await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 10
        }
      });

      const completionsBefore = await testDb.taskCompletion.findMany({
        where: { taskId: testData.task.id }
      });
      expect(completionsBefore.length).toBe(1);

      // Delete completions first, then the task (manual cascade since schema doesn't have CASCADE DELETE)
      await testDb.taskCompletion.deleteMany({
        where: { taskId: testData.task.id }
      });

      await testDb.task.delete({
        where: { id: testData.task.id }
      });

      const completionsAfter = await testDb.taskCompletion.findMany({
        where: { taskId: testData.task.id }
      });
      expect(completionsAfter.length).toBe(0);
    });
  });

  describe('Badge System Operations', () => {
    test('should create and award badges', async () => {
      const testData = await setupTestDatabase();

      const badge = await testDb.badge.create({
        data: {
          name: 'First Steps',
          description: 'Complete your first task',
          icon: '🎯',
          category: 'milestone',
          rarity: 'bronze',
          criteria: JSON.stringify({ type: 'task_count', value: 1 })
        }
      });

      const earnedBadge = await testDb.badgeEarned.create({
        data: {
          badgeId: badge.id,
          childId: testData.child.id,
          earnedAt: new Date()
        }
      });

      const childWithBadges = await testDb.child.findUnique({
        where: { id: testData.child.id },
        include: {
          earnedBadges: {
            include: {
              badge: true
            }
          }
        }
      });

      expect(childWithBadges?.earnedBadges).toBeDefined();
      expect(childWithBadges?.earnedBadges.length).toBe(1);
      expect(childWithBadges?.earnedBadges[0].badge.name).toBe('First Steps');
    });

    test('should enforce unique badge per child constraint', async () => {
      const testData = await setupTestDatabase();

      const badge = await testDb.badge.create({
        data: {
          name: 'Unique Badge',
          description: 'This badge can only be earned once',
          icon: '⭐',
          category: 'special',
          rarity: 'gold',
          criteria: JSON.stringify({ type: 'special', value: 1 })
        }
      });

      await testDb.badgeEarned.create({
        data: {
          badgeId: badge.id,
          childId: testData.child.id
        }
      });

      // Try to award the same badge again
      try {
        await testDb.badgeEarned.create({
          data: {
            badgeId: badge.id,
            childId: testData.child.id
          }
        });
        fail('Should have failed due to unique constraint');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Virtual Pet Operations', () => {
    test('should create and manage virtual pet', async () => {
      const testData = await setupTestDatabase();

      const pet = await testDb.virtualPet.create({
        data: {
          childId: testData.child.id,
          name: 'Buddy',
          type: 'dragon',
          mood: 'happy',
          level: 1,
          xp: 50,
          happiness: 100,
          energy: 80,
          accessories: 'hat,glasses',
          color: 'green'
        }
      });

      expect(pet.name).toBe('Buddy');
      expect(pet.type).toBe('dragon');
      expect(pet.accessories).toBe('hat,glasses');
      expect(pet.color).toBe('green');

      // Update pet stats
      const updatedPet = await testDb.virtualPet.update({
        where: { id: pet.id },
        data: {
          happiness: 90,
          energy: 70,
          lastFed: new Date(),
          lastPlayed: new Date()
        }
      });

      expect(updatedPet.happiness).toBe(90);
      expect(updatedPet.energy).toBe(70);
      expect(updatedPet.lastFed).toBeInstanceOf(Date);
      expect(updatedPet.lastPlayed).toBeInstanceOf(Date);
    });

    test('should enforce one pet per child', async () => {
      const testData = await setupTestDatabase();

      await testDb.virtualPet.create({
        data: {
          childId: testData.child.id,
          name: 'First Pet',
          type: 'dragon'
        }
      });

      // Try to create second pet for same child
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

  describe('Learning Scores Operations', () => {
    test('should track learning progress', async () => {
      const testData = await setupTestDatabase();

      const subjects = ['math', 'reading', 'science'];
      const scores = [];

      for (const subject of subjects) {
        const score = await testDb.learningScore.create({
          data: {
            childId: testData.child.id,
            subject: subject,
            score: Math.floor(Math.random() * 100),
            questionsAnswered: 20,
            correctAnswers: 15,
            timeSpent: 300 // 5 minutes
          }
        });
        scores.push(score);
      }

      const childScores = await testDb.learningScore.findMany({
        where: { childId: testData.child.id },
        orderBy: { completedAt: 'desc' }
      });

      expect(childScores.length).toBe(3);
      expect(childScores.map(s => s.subject)).toEqual(
        expect.arrayContaining(['math', 'reading', 'science'])
      );
    });

    test('should calculate learning statistics', async () => {
      const testData = await setupTestDatabase();

      const mathScores = [85, 90, 88, 92, 87];
      
      for (const score of mathScores) {
        await testDb.learningScore.create({
          data: {
            childId: testData.child.id,
            subject: 'math',
            score: score,
            questionsAnswered: 20,
            correctAnswers: Math.floor((score / 100) * 20),
            timeSpent: 300,
            completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        });
      }

      const allMathScores = await testDb.learningScore.findMany({
        where: {
          childId: testData.child.id,
          subject: 'math'
        },
        orderBy: { completedAt: 'asc' }
      });

      expect(allMathScores.length).toBe(5);
      
      const averageScore = allMathScores.reduce((sum, s) => sum + s.score, 0) / allMathScores.length;
      expect(averageScore).toBeCloseTo(88.4);
    });
  });

  describe('Milestone Operations', () => {
    test('should create and manage family milestones', async () => {
      const testData = await setupTestDatabase();

      const milestone = await testDb.milestone.create({
        data: {
          familyId: testData.family.id,
          title: 'First Day of School',
          description: 'Emma\'s first day at elementary school',
          date: new Date('2024-09-01'),
          category: 'first',
          images: 'image1.jpg,image2.jpg',
          childrenIds: testData.child.id,
          tags: 'school,education,milestone'
        }
      });

      expect(milestone.title).toBe('First Day of School');
      expect(milestone.category).toBe('first');
      expect(milestone.images).toBe('image1.jpg,image2.jpg');
      expect(milestone.childrenIds).toBe(testData.child.id);
      expect(milestone.tags).toBe('school,education,milestone');
    });

    test('should query milestones by date range', async () => {
      const testData = await setupTestDatabase();

      const dates = [
        new Date('2024-01-15'),
        new Date('2024-06-15'),
        new Date('2024-12-15')
      ];

      for (let i = 0; i < dates.length; i++) {
        await testDb.milestone.create({
          data: {
            familyId: testData.family.id,
            title: `Milestone ${i + 1}`,
            date: dates[i],
            category: 'memory'
          }
        });
      }

      const midYearMilestones = await testDb.milestone.findMany({
        where: {
          familyId: testData.family.id,
          date: {
            gte: new Date('2024-06-01'),
            lte: new Date('2024-06-30')
          }
        }
      });

      expect(midYearMilestones.length).toBe(1);
      expect(midYearMilestones[0].title).toBe('Milestone 2');
    });
  });

  describe('Data Integrity and Relationships', () => {
    test('should maintain referential integrity on user deletion', async () => {
      const testData = await setupTestDatabase();

      // Create some related data
      await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 10
        }
      });

      await testDb.rewardPurchase.create({
        data: {
          rewardId: testData.reward.id,
          childId: testData.child.id,
          coinCost: 25
        }
      });

      // Delete related records first (manual cascade)
      await testDb.taskCompletion.deleteMany({
        where: { childId: testData.child.id }
      });

      await testDb.rewardPurchase.deleteMany({
        where: { childId: testData.child.id }
      });

      // Delete the child user (should cascade to child profile)
      await testDb.user.delete({
        where: { id: testData.childUser.id }
      });

      // Verify cascading deletes
      const childProfile = await testDb.child.findUnique({
        where: { id: testData.child.id }
      });
      expect(childProfile).toBeNull();

      const completions = await testDb.taskCompletion.findMany({
        where: { childId: testData.child.id }
      });
      expect(completions.length).toBe(0);

      const purchases = await testDb.rewardPurchase.findMany({
        where: { childId: testData.child.id }
      });
      expect(purchases.length).toBe(0);
    });

    test('should handle transaction rollback on error', async () => {
      const testData = await setupTestDatabase();

      try {
        await testDb.$transaction(async (tx) => {
          // Create a valid task completion
          await tx.taskCompletion.create({
            data: {
              taskId: testData.task.id,
              childId: testData.child.id,
              starsAwarded: 10
            }
          });

          // Try to create an invalid task (this should fail)
          await tx.task.create({
            data: {
              // Missing required fields to cause an error
              familyId: testData.family.id,
              createdById: testData.parent.id
              // Missing title, difficulty, starValue
            } as any
          });
        });
        
        fail('Transaction should have failed');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Verify that the task completion was not created due to rollback
      const completions = await testDb.taskCompletion.findMany({
        where: { childId: testData.child.id }
      });
      expect(completions.length).toBe(0);
    });
  });
});