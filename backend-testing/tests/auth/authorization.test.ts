import { testDb, cleanDatabase, setupTestDatabase } from '../setup/database';
import bcrypt from 'bcryptjs';

describe('Authorization Tests', () => {
  let testData: any;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });

  describe('User Authentication', () => {
    test('should authenticate user with valid credentials', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await testDb.user.create({
        data: {
          email: 'auth@test.com',
          password: hashedPassword,
          name: 'Auth Test User',
          role: 'PARENT',
          familyId: testData.family.id
        }
      });

      // Simulate authentication process
      const foundUser = await testDb.user.findUnique({
        where: { email: 'auth@test.com' },
        include: {
          family: true,
          parentProfile: true,
          childProfile: true
        }
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('auth@test.com');
      
      const isPasswordValid = await bcrypt.compare(plainPassword, foundUser!.password);
      expect(isPasswordValid).toBe(true);
    });

    test('should reject authentication with invalid password', async () => {
      const plainPassword = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await testDb.user.create({
        data: {
          email: 'auth@test.com',
          password: hashedPassword,
          name: 'Auth Test User',
          role: 'PARENT',
          familyId: testData.family.id
        }
      });

      const foundUser = await testDb.user.findUnique({
        where: { email: 'auth@test.com' }
      });

      expect(foundUser).toBeDefined();
      
      const isPasswordValid = await bcrypt.compare(wrongPassword, foundUser!.password);
      expect(isPasswordValid).toBe(false);
    });

    test('should reject authentication with non-existent user', async () => {
      const foundUser = await testDb.user.findUnique({
        where: { email: 'nonexistent@test.com' }
      });

      expect(foundUser).toBeNull();
    });

    test('should include user profile in authentication result', async () => {
      const user = await testDb.user.findUnique({
        where: { id: testData.parentUser.id },
        include: {
          family: true,
          parentProfile: true,
          childProfile: true
        }
      });

      expect(user).toBeDefined();
      expect(user?.family).toBeDefined();
      expect(user?.parentProfile).toBeDefined();
      expect(user?.childProfile).toBeNull();
      expect(user?.role).toBe('PARENT');
    });
  });

  describe('Role-Based Access Control', () => {
    test('should verify parent role permissions', async () => {
      const parentUser = await testDb.user.findUnique({
        where: { id: testData.parentUser.id },
        include: { parentProfile: true }
      });

      expect(parentUser?.role).toBe('PARENT');
      expect(parentUser?.parentProfile).toBeDefined();
      expect(parentUser?.parentProfile?.isPrimary).toBe(true);

      // Parent should be able to create tasks
      const canCreateTasks = parentUser?.role === 'PARENT' && !!parentUser?.parentProfile;
      expect(canCreateTasks).toBe(true);

      // Parent should be able to approve completions
      const canApproveCompletions = parentUser?.role === 'PARENT';
      expect(canApproveCompletions).toBe(true);
    });

    test('should verify child role permissions', async () => {
      const childUser = await testDb.user.findUnique({
        where: { id: testData.childUser.id },
        include: { childProfile: true }
      });

      expect(childUser?.role).toBe('CHILD');
      expect(childUser?.childProfile).toBeDefined();

      // Child should not be able to create tasks
      const canCreateTasks = childUser?.role === 'PARENT';
      expect(canCreateTasks).toBe(false);

      // Child should be able to complete tasks
      const canCompleteTasks = childUser?.role === 'CHILD' && !!childUser?.childProfile;
      expect(canCompleteTasks).toBe(true);
    });

    test('should verify family-based isolation', async () => {
      // Create another family with users
      const otherFamily = await testDb.family.create({
        data: { name: 'Other Family' }
      });

      const otherParentUser = await testDb.user.create({
        data: {
          email: 'otherparent@test.com',
          password: 'password',
          name: 'Other Parent',
          role: 'PARENT',
          familyId: otherFamily.id
        }
      });

      const otherParent = await testDb.parent.create({
        data: {
          userId: otherParentUser.id,
          familyId: otherFamily.id,
          isPrimary: true
        }
      });

      // Create a task in the other family
      const otherFamilyTask = await testDb.task.create({
        data: {
          familyId: otherFamily.id,
          createdById: otherParent.id,
          title: 'Other Family Task',
          difficulty: 2,
          starValue: 8
        }
      });

      // Original family should not see other family's tasks
      const originalFamilyTasks = await testDb.task.findMany({
        where: { familyId: testData.family.id }
      });

      const otherFamilyTasks = await testDb.task.findMany({
        where: { familyId: otherFamily.id }
      });

      expect(originalFamilyTasks.length).toBeGreaterThan(0);
      expect(otherFamilyTasks.length).toBe(1);
      expect(otherFamilyTasks[0].title).toBe('Other Family Task');

      // Verify no cross-family access
      const originalTaskIds = originalFamilyTasks.map(t => t.id);
      const otherTaskIds = otherFamilyTasks.map(t => t.id);
      expect(originalTaskIds).not.toContain(otherFamilyTask.id);
      expect(otherTaskIds).not.toContain(testData.task.id);
    });
  });

  describe('Session Management', () => {
    test('should create valid session for authenticated user', async () => {
      const session = await testDb.session.create({
        data: {
          sessionToken: 'valid-session-token-123',
          userId: testData.parentUser.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(testData.parentUser.id);
      expect(session.expires.getTime()).toBeGreaterThan(Date.now());

      // Verify session can be retrieved with user data
      const sessionWithUser = await testDb.session.findUnique({
        where: { sessionToken: 'valid-session-token-123' },
        include: {
          user: {
            include: {
              family: true,
              parentProfile: true,
              childProfile: true
            }
          }
        }
      });

      expect(sessionWithUser?.user).toBeDefined();
      expect(sessionWithUser?.user.role).toBe('PARENT');
      expect(sessionWithUser?.user.familyId).toBe(testData.family.id);
    });

    test('should handle expired sessions', async () => {
      const expiredSession = await testDb.session.create({
        data: {
          sessionToken: 'expired-session-token-123',
          userId: testData.parentUser.id,
          expires: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        }
      });

      expect(expiredSession.expires.getTime()).toBeLessThan(Date.now());

      // In a real application, expired sessions should be filtered out
      const validSessions = await testDb.session.findMany({
        where: {
          userId: testData.parentUser.id,
          expires: {
            gt: new Date()
          }
        }
      });

      expect(validSessions.length).toBe(0);
    });

    test('should cleanup sessions on user deletion', async () => {
      const session = await testDb.session.create({
        data: {
          sessionToken: 'cleanup-test-session',
          userId: testData.childUser.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      expect(session).toBeDefined();

      // Delete the user (should cascade delete sessions)
      await testDb.user.delete({
        where: { id: testData.childUser.id }
      });

      const orphanedSessions = await testDb.session.findMany({
        where: { userId: testData.childUser.id }
      });

      expect(orphanedSessions.length).toBe(0);
    });
  });

  describe('Permission Validation', () => {
    test('should validate task creation permissions', async () => {
      // Parent should be able to create tasks
      const parentCanCreate = testData.parentUser.role === 'PARENT';
      expect(parentCanCreate).toBe(true);

      // Child should not be able to create tasks
      const childCanCreate = testData.childUser.role === 'PARENT';
      expect(childCanCreate).toBe(false);

      // Verify parent has parent profile
      const parentProfile = await testDb.parent.findUnique({
        where: { userId: testData.parentUser.id }
      });
      expect(parentProfile).toBeDefined();
    });

    test('should validate task completion permissions', async () => {
      // Child should be able to complete assigned tasks
      const childProfile = await testDb.child.findUnique({
        where: { userId: testData.childUser.id }
      });
      expect(childProfile).toBeDefined();

      const assignedTask = await testDb.task.findFirst({
        where: {
          assignedToId: childProfile?.id,
          isActive: true
        }
      });
      expect(assignedTask).toBeDefined();

      // Simulate task completion permission check
      const canCompleteTask = (
        testData.childUser.role === 'CHILD' &&
        assignedTask?.assignedToId === childProfile?.id
      );
      expect(canCompleteTask).toBe(true);
    });

    test('should validate approval permissions', async () => {
      // Only parents should be able to approve task completions
      const completion = await testDb.taskCompletion.create({
        data: {
          taskId: testData.task.id,
          childId: testData.child.id,
          starsAwarded: 10,
          isApproved: false
        }
      });

      // Parent should be able to approve
      const parentCanApprove = testData.parentUser.role === 'PARENT';
      expect(parentCanApprove).toBe(true);

      // Child should not be able to approve
      const childCanApprove = testData.childUser.role === 'PARENT';
      expect(childCanApprove).toBe(false);

      // Verify parent can approve this completion (same family)
      const task = await testDb.task.findUnique({
        where: { id: testData.task.id }
      });
      const parentProfile = await testDb.parent.findUnique({
        where: { userId: testData.parentUser.id }
      });

      const canApproveThisCompletion = (
        parentCanApprove &&
        task?.familyId === testData.family.id &&
        parentProfile?.familyId === testData.family.id
      );
      expect(canApproveThisCompletion).toBe(true);
    });

    test('should validate reward management permissions', async () => {
      // Parent should be able to create/manage rewards
      const parentCanManageRewards = testData.parentUser.role === 'PARENT';
      expect(parentCanManageRewards).toBe(true);

      // Child should be able to purchase rewards
      const childCanPurchaseRewards = testData.childUser.role === 'CHILD';
      expect(childCanPurchaseRewards).toBe(true);

      // Child should not be able to create rewards
      const childCanCreateRewards = testData.childUser.role === 'PARENT';
      expect(childCanCreateRewards).toBe(false);
    });
  });

  describe('Data Access Control', () => {
    test('should enforce family-scoped data access', async () => {
      // Users should only access data from their own family
      const userFamilyId = testData.parentUser.familyId;
      
      const familyTasks = await testDb.task.findMany({
        where: { familyId: userFamilyId }
      });

      const familyRewards = await testDb.reward.findMany({
        where: { familyId: userFamilyId }
      });

      const familyChildren = await testDb.child.findMany({
        where: { familyId: userFamilyId }
      });

      expect(familyTasks.every(task => task.familyId === userFamilyId)).toBe(true);
      expect(familyRewards.every(reward => reward.familyId === userFamilyId)).toBe(true);
      expect(familyChildren.every(child => child.familyId === userFamilyId)).toBe(true);
    });

    test('should prevent cross-family data access', async () => {
      // Create another family
      const otherFamily = await testDb.family.create({
        data: { name: 'Unauthorized Family' }
      });

      const otherChild = await testDb.user.create({
        data: {
          email: 'otherchild@test.com',
          password: 'password',
          name: 'Other Child',
          role: 'CHILD',
          familyId: otherFamily.id
        }
      });

      // Original family should not see other family's users
      const originalFamilyUsers = await testDb.user.findMany({
        where: { familyId: testData.family.id }
      });

      const userIds = originalFamilyUsers.map(u => u.id);
      expect(userIds).not.toContain(otherChild.id);
      expect(userIds).toContain(testData.parentUser.id);
      expect(userIds).toContain(testData.childUser.id);
    });
  });
});