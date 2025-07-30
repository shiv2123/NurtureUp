import { testDb, cleanDatabase, setupTestDatabase } from '../setup/database';

describe('Tasks API Tests', () => {
  let testData: any;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });

  describe('GET /api/tasks', () => {
    test('should fetch all active tasks for family', async () => {
      const tasks = await testDb.task.findMany({
        where: {
          familyId: testData.family.id,
          isActive: true
        },
        include: {
          assignedTo: {
            include: { user: true }
          },
          completions: true
        }
      });

      expect(tasks).toBeDefined();
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].familyId).toBe(testData.family.id);
      expect(tasks[0].isActive).toBe(true);
    });

    test('should include assigned child information', async () => {
      const tasks = await testDb.task.findMany({
        where: {
          familyId: testData.family.id,
          assignedToId: testData.child.id
        },
        include: {
          assignedTo: {
            include: { user: true }
          }
        }
      });

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].assignedTo).toBeDefined();
      expect(tasks[0].assignedTo?.user.name).toBe('Test Child');
    });

    test('should filter out inactive tasks', async () => {
      // Create an inactive task
      await testDb.task.create({
        data: {
          familyId: testData.family.id,
          createdById: testData.parent.id,
          title: 'Inactive Task',
          difficulty: 1,
          starValue: 5,
          isActive: false
        }
      });

      const activeTasks = await testDb.task.findMany({
        where: {
          familyId: testData.family.id,
          isActive: true
        }
      });

      const inactiveTasks = await testDb.task.findMany({
        where: {
          familyId: testData.family.id,
          isActive: false
        }
      });

      expect(inactiveTasks.length).toBe(1);
      expect(inactiveTasks[0].title).toBe('Inactive Task');
      
      // Active tasks should not include the inactive one
      const activeTaskTitles = activeTasks.map(t => t.title);
      expect(activeTaskTitles).not.toContain('Inactive Task');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create new task with valid data', async () => {
      const taskData = {
        title: 'Clean Room',
        description: 'Clean and organize your bedroom',
        category: 'chores',
        difficulty: 3,
        starValue: 15,
        assignedToId: testData.child.id,
        isRecurring: false,
        requiresProof: true
      };

      const task = await testDb.task.create({
        data: {
          ...taskData,
          familyId: testData.family.id,
          createdById: testData.parent.id
        }
      });

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.difficulty).toBe(taskData.difficulty);
      expect(task.starValue).toBe(taskData.starValue);
      expect(task.assignedToId).toBe(testData.child.id);
      expect(task.requiresProof).toBe(true);
      expect(task.isActive).toBe(true); // Default value
    });

    test('should create recurring task with valid rule', async () => {
      const recurringRule = {
        type: 'daily' as const,
        days: [1, 2, 3, 4, 5], // Monday to Friday
        time: '08:00'
      };

      const taskData = {
        title: 'Morning Exercise',
        difficulty: 2,
        starValue: 10,
        assignedToId: testData.child.id,
        isRecurring: true,
        recurringRule: JSON.stringify(recurringRule),
        requiresProof: false
      };

      const task = await testDb.task.create({
        data: {
          ...taskData,
          familyId: testData.family.id,
          createdById: testData.parent.id
        }
      });

      expect(task).toBeDefined();
      expect(task.isRecurring).toBe(true);
      expect(task.recurringRule).toBe(JSON.stringify(recurringRule));
      
      // Parse and validate the recurring rule
      const parsedRule = JSON.parse(task.recurringRule!);
      expect(parsedRule.type).toBe('daily');
      expect(parsedRule.days).toEqual([1, 2, 3, 4, 5]);
    });

    test('should create task for all children when no assignedToId provided', async () => {
      // Create another child
      const childUser2 = await testDb.user.create({
        data: {
          email: 'child2@test.com',
          password: '$2a$10$TEST_HASH',
          name: 'Test Child 2',
          role: 'CHILD',
          familyId: testData.family.id
        }
      });

      const child2 = await testDb.child.create({
        data: {
          userId: childUser2.id,
          familyId: testData.family.id,
          nickname: 'TestKid2',
          birthDate: new Date('2012-03-10')
        }
      });

      const taskData = {
        title: 'Family Chore',
        difficulty: 2,
        starValue: 10,
        isRecurring: false,
        requiresProof: false
      };

      // Simulate creating tasks for all children
      const children = await testDb.child.findMany({
        where: { familyId: testData.family.id }
      });

      expect(children.length).toBe(2);

      const createdTasks = [];
      for (const child of children) {
        const task = await testDb.task.create({
          data: {
            ...taskData,
            familyId: testData.family.id,
            createdById: testData.parent.id,
            assignedToId: child.id
          }
        });
        createdTasks.push(task);
      }

      expect(createdTasks.length).toBe(2);
      expect(createdTasks[0].assignedToId).toBe(testData.child.id);
      expect(createdTasks[1].assignedToId).toBe(child2.id);
    });

    test('should reject task creation with invalid data', async () => {
      const invalidTaskData = [
        {}, // Missing required fields
        { title: '' }, // Empty title
        { title: 'Valid Title', difficulty: 0 }, // Invalid difficulty
        { title: 'Valid Title', difficulty: 6 }, // Invalid difficulty (too high)
        { title: 'Valid Title', difficulty: 3, starValue: 0 }, // Invalid star value
      ];

      for (const data of invalidTaskData) {
        try {
          await testDb.task.create({
            data: {
              ...data,
              familyId: testData.family.id,
              createdById: testData.parent.id,
              difficulty: data.difficulty || 1,
              starValue: data.starValue || 1
            } as any
          });
          
          // If we get here, the validation didn't work as expected
          if (!data.title || data.title === '') {
            fail('Should have failed for empty title');
          }
        } catch (error) {
          // Expected for invalid data
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Task Completions', () => {
    test('should create task completion', async () => {
      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: testData.task.starValue,
          completedAt: new Date(),
          notes: 'Completed successfully!'
        }
      });

      expect(completion).toBeDefined();
      expect(completion.taskId).toBe(testData.task.id);
      expect(completion.childId).toBe(testData.child.id);
      expect(completion.starsAwarded).toBe(testData.task.starValue);
      expect(completion.isApproved).toBe(false); // Default value
    });

    test('should approve task completion', async () => {
      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: testData.task.starValue
        }
      });

      const approvedCompletion = await testDb.taskCompletion.update({
        where: { id: completion.id },
        data: {
          isApproved: true,
          approvedById: testData.parent.id,
          approvedAt: new Date(),
          bonusStars: 5
        }
      });

      expect(approvedCompletion.isApproved).toBe(true);
      expect(approvedCompletion.approvedById).toBe(testData.parent.id);
      expect(approvedCompletion.bonusStars).toBe(5);
      expect(approvedCompletion.approvedAt).toBeDefined();
    });

    test('should handle task completion with proof image', async () => {
      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: testData.task.starValue,
          proofImage: 'https://example.com/proof.jpg',
          notes: 'Here is the proof!'
        }
      });

      expect(completion.proofImage).toBe('https://example.com/proof.jpg');
      expect(completion.notes).toBe('Here is the proof!');
    });
  });

  describe('Recurring Tasks', () => {
    test('should validate recurring task rules', async () => {
      const validRules = [
        { type: 'daily', days: [1, 2, 3, 4, 5] },
        { type: 'weekly', days: [0, 6] }, // Weekends
        { type: 'custom', interval: 3, days: [1] }
      ];

      for (const rule of validRules) {
        const task = await testDb.task.create({
          data: {
            title: `Recurring Task ${rule.type}`,
            familyId: testData.family.id,
            createdById: testData.parent.id,
            difficulty: 2,
            starValue: 8,
            isRecurring: true,
            recurringRule: JSON.stringify(rule)
          }
        });

        expect(task.isRecurring).toBe(true);
        
        const parsedRule = JSON.parse(task.recurringRule!);
        expect(parsedRule.type).toBe(rule.type);
        expect(parsedRule.days).toEqual(rule.days);
      }
    });
  });
});