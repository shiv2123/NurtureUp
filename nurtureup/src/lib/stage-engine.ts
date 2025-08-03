/**
 * NurtureUp Stage Engine
 * 
 * Core logic for determining child development stage and adapting UI accordingly.
 * Based on the blueprint specifications for stage-aware adaptive interfaces.
 */

export type ChildStage = 
  | 'newborn'         // 0-12 months
  | 'toddler'         // 1-3 years  
  | 'early-childhood' // 4-6 years
  | 'school-age'      // 7-12 years
  | 'adolescence'     // 13-18 years

export type ParentStage =
  | 'ttc_pregnancy'   // TTC & Pregnancy
  | 'newborn_infant'  // 0-12 months
  | 'toddler'         // 1-3 years
  | 'early_childhood' // 4-6 years
  | 'school_age'      // 7-12 years
  | 'adolescence'     // 13-18 years

export interface StageConfig {
  stage: ChildStage | ParentStage
  displayName: string
  description: string
  ageRange: string
  primaryColor: string
  uiTheme: 'child' | 'parent'
  features: string[]
  navigation: NavigationConfig
}

export interface NavigationConfig {
  tabs: TabConfig[]
  gestures: GestureConfig[]
}

export interface TabConfig {
  id: string
  label: string
  icon: string
  order: number
}

export interface GestureConfig {
  gesture: string
  action: string
  description: string
}

/**
 * Calculate child's development stage based on date of birth
 */
export function calculateChildStage(dateOfBirth: Date): ChildStage {
  const now = new Date()
  const ageInMonths = (now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  
  if (ageInMonths < 12) {
    return 'newborn'
  } else if (ageInMonths < 36) { // 3 years
    return 'toddler'
  } else if (ageInMonths < 84) { // 7 years  
    return 'early-childhood'
  } else if (ageInMonths < 156) { // 13 years
    return 'school-age'
  } else {
    return 'adolescence'
  }
}

/**
 * Get parent stage based on youngest child's stage
 */
export function calculateParentStage(children: { dateOfBirth: Date; stage?: ChildStage }[]): ParentStage {
  if (children.length === 0) {
    return 'ttc_pregnancy'
  }
  
  // Find the youngest child's stage
  const youngestChild = children.reduce((youngest, child) => {
    return child.dateOfBirth > youngest.dateOfBirth ? child : youngest
  })
  
  const childStage = youngestChild.stage || calculateChildStage(youngestChild.dateOfBirth)
  
  // Parent stage mirrors child stage for now
  switch (childStage) {
    case 'newborn':
      return 'newborn_infant'
    case 'toddler':
      return 'toddler'
    case 'early-childhood':
      return 'early_childhood'
    case 'school-age':
      return 'school_age'
    case 'adolescence':
      return 'adolescence'
    default:
      return 'ttc_pregnancy'
  }
}

/**
 * Wrapper function for calculating parent stage (used by parent home page)
 */
export function getParentStage(children: { id: string; name: string; dateOfBirth: Date }[]): ParentStage {
  return calculateParentStage(children)
}

/**
 * Stage configuration lookup table based on blueprint specifications
 */
export const STAGE_CONFIGS: Record<ChildStage | ParentStage, StageConfig> = {
  'ttc_pregnancy': {
    stage: 'ttc_pregnancy',
    displayName: 'TTC & Pregnancy',
    description: 'Pregnancy tracking and preparation',
    ageRange: 'Planning - Birth',
    primaryColor: '#8B7EFF',
    uiTheme: 'parent',
    features: ['Cycle Tracker', 'Growth Tracker', 'Checklist', 'Partner Tips'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'tracker', label: 'Tracker', icon: 'calendar', order: 2 },
        { id: 'library', label: 'Library', icon: 'book', order: 3 },
        { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'open-checklist', description: 'Swipe right from Home opens Checklist overlay' },
        { gesture: 'long-press-home', action: 'quick-log-symptom', description: 'Long-press Home icon for quick symptom log' },
      ]
    }
  },
  
  'newborn': {
    stage: 'newborn',
    displayName: 'Newborn/Infant',
    description: 'Essential care tracking for 0-12 months',
    ageRange: '0-12 months',
    primaryColor: '#88D8B0',
    uiTheme: 'parent',
    features: ['Feed Tracking', 'Sleep Tracker', 'Diaper Log', 'Growth Charts', 'Milestones'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'log', label: 'Log', icon: 'edit', order: 2 },
        { id: 'growth', label: 'Growth', icon: 'trending-up', order: 3 },
        { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'pediatric-checklist', description: 'Swipe right opens Pediatric Checklist' },
        { gesture: 'long-press-log', action: 'default-log-feed', description: 'Long-press Log icon starts Feed log' },
      ]
    }
  },

  'newborn_infant': {
    stage: 'newborn_infant',
    displayName: 'Newborn/Infant',
    description: 'Essential care tracking for 0-12 months',
    ageRange: '0-12 months',
    primaryColor: '#88D8B0',
    uiTheme: 'parent',
    features: ['Feed Tracking', 'Sleep Tracker', 'Diaper Log', 'Growth Charts', 'Milestones'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'log', label: 'Log', icon: 'edit', order: 2 },
        { id: 'growth', label: 'Growth', icon: 'trending-up', order: 3 },
        { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'pediatric-checklist', description: 'Swipe right opens Pediatric Checklist' },
        { gesture: 'long-press-log', action: 'default-log-feed', description: 'Long-press Log icon starts Feed log' },
      ]
    }
  },

  'toddler': {
    stage: 'toddler',
    displayName: 'Toddler',
    description: 'Behavior tracking and routine building',
    ageRange: '1-3 years',
    primaryColor: '#FFB13D',
    uiTheme: 'parent',
    features: ['Behavior Tracker', 'Potty Training', 'Play Ideas', 'Calm-Down Tools', 'Routine Scheduler'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'routine', label: 'Routine', icon: 'clock', order: 2 },
        { id: 'play', label: 'Play', icon: 'gamepad-2', order: 3 },
        { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'behavior-summary', description: 'Swipe right opens Behavior Summary overlay' },
        { gesture: 'long-press-routine', action: 'quick-potty-timer', description: 'Long-press Routine icon starts Potty Timer' },
        { gesture: 'shake', action: 'calm-down-toolbox', description: 'Shake phone opens Calm-Down toolbox fullscreen' },
      ]
    }
  },

  'early-childhood': {
    stage: 'early-childhood',
    displayName: 'Early Childhood',
    description: 'School readiness and structured learning',
    ageRange: '4-6 years',
    primaryColor: '#4F8EF7',
    uiTheme: 'parent',
    features: ['Chore Board', 'Learning Games', 'School Readiness', 'Family Calendar', 'Star Rewards'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'chores', label: 'Chores', icon: 'check-square', order: 2 },
        { id: 'learn', label: 'Learn', icon: 'book-open', order: 3 },
        { id: 'calendar', label: 'Calendar', icon: 'calendar', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'school-readiness-checklist', description: 'Swipe right opens School Readiness Checklist' },
        { gesture: 'long-press-chores', action: 'quick-add-chore', description: 'Long-press Chores icon opens quick-add chore modal' },
      ]
    }
  },

  'early_childhood': {
    stage: 'early_childhood',
    displayName: 'Early Childhood',
    description: 'School readiness and structured learning',
    ageRange: '4-6 years',
    primaryColor: '#4F8EF7',
    uiTheme: 'parent',
    features: ['Chore Board', 'Learning Games', 'School Readiness', 'Family Calendar', 'Star Rewards'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'chores', label: 'Chores', icon: 'check-square', order: 2 },
        { id: 'learn', label: 'Learn', icon: 'book-open', order: 3 },
        { id: 'calendar', label: 'Calendar', icon: 'calendar', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'school-readiness-checklist', description: 'Swipe right opens School Readiness Checklist' },
        { gesture: 'long-press-chores', action: 'quick-add-chore', description: 'Long-press Chores icon opens quick-add chore modal' },
      ]
    }
  },

  'school-age': {
    stage: 'school-age',
    displayName: 'School Age',
    description: 'Academic support and independence building',
    ageRange: '7-12 years',
    primaryColor: '#3E6ED8',
    uiTheme: 'parent',
    features: ['Homework Tracker', 'Activity Calendar', 'Mini-Wallet', 'Screen-Time Manager', 'Streak Widget'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'school', label: 'School', icon: 'graduation-cap', order: 2 },
        { id: 'wallet', label: 'Wallet', icon: 'wallet', order: 3 },
        { id: 'screentime', label: 'Screen Time', icon: 'smartphone', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'homework-board', description: 'Swipe right opens Homework Board overlay' },
        { gesture: 'long-press-screentime', action: 'quick-grant-15min', description: 'Long-press Screen Time icon for quick +15 min grant' },
      ]
    }
  },

  'school_age': {
    stage: 'school_age',
    displayName: 'School Age',
    description: 'Academic support and independence building',
    ageRange: '7-12 years',
    primaryColor: '#3E6ED8',
    uiTheme: 'parent',
    features: ['Homework Tracker', 'Activity Calendar', 'Mini-Wallet', 'Screen-Time Manager', 'Streak Widget'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'school', label: 'School', icon: 'graduation-cap', order: 2 },
        { id: 'wallet', label: 'Wallet', icon: 'wallet', order: 3 },
        { id: 'screentime', label: 'Screen Time', icon: 'smartphone', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'homework-board', description: 'Swipe right opens Homework Board overlay' },
        { gesture: 'long-press-screentime', action: 'quick-grant-15min', description: 'Long-press Screen Time icon for quick +15 min grant' },
      ]
    }
  },

  'adolescence': {
    stage: 'adolescence',
    displayName: 'Adolescence',
    description: 'Privacy-respecting life skills and autonomy',
    ageRange: '13-18 years',
    primaryColor: '#2E4A9F',
    uiTheme: 'parent',
    features: ['Today Feed', 'Planner', 'Wellbeing Center', 'Life-Skills Tasks', 'Privacy Controls'],
    navigation: {
      tabs: [
        { id: 'home', label: 'Home', icon: 'home', order: 1 },
        { id: 'planner', label: 'Planner', icon: 'calendar-days', order: 2 },
        { id: 'wellbeing', label: 'Wellbeing', icon: 'heart', order: 3 },
        { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
      ],
      gestures: [
        { gesture: 'swipe-right', action: 'college-timeline', description: 'Swipe right opens College Timeline overlay' },
        { gesture: 'long-press-wellbeing', action: 'quick-mood-checkin', description: 'Long-press Wellbeing icon for quick mood check-in' },
        { gesture: 'two-finger-swipe-down', action: 'location-checkin', description: 'Two-finger swipe down opens Location Check-In prompt' },
      ]
    }
  },
}

/**
 * Get stage configuration for a given stage
 */
export function getStageConfig(stage: ChildStage | ParentStage): StageConfig | null {
  return STAGE_CONFIGS[stage] || null
}

/**
 * Get navigation configuration for parent based on youngest child's stage
 */
export function getParentNavigationConfig(childrenStages: ChildStage[]): NavigationConfig {
  if (childrenStages.length === 0) {
    return STAGE_CONFIGS['ttc_pregnancy']?.navigation || {
      tabs: [],
      gestures: []
    }
  }
  
  // Find youngest child's stage (most restrictive)
  const youngestStage = childrenStages.reduce((youngest, current) => {
    const ageOrder: ChildStage[] = ['newborn', 'toddler', 'early-childhood', 'school-age', 'adolescence']
    return ageOrder.indexOf(current) < ageOrder.indexOf(youngest) ? current : youngest
  })
  
  // Parent navigation matches youngest child's needs
  switch (youngestStage) {
    case 'newborn':
      return {
        tabs: [
          { id: 'home', label: 'Home', icon: 'home', order: 1 },
          { id: 'log', label: 'Log', icon: 'edit', order: 2 },
          { id: 'growth', label: 'Growth', icon: 'trending-up', order: 3 },
          { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
        ],
        gestures: []
      }
    case 'toddler':
      return {
        tabs: [
          { id: 'home', label: 'Home', icon: 'home', order: 1 },
          { id: 'routine', label: 'Routine', icon: 'clock', order: 2 },
          { id: 'play', label: 'Play', icon: 'gamepad-2', order: 3 },
          { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
        ],
        gestures: []
      }
    case 'early-childhood':
      return {
        tabs: [
          { id: 'home', label: 'Home', icon: 'home', order: 1 },
          { id: 'chores', label: 'Chores', icon: 'check-square', order: 2 },
          { id: 'learn', label: 'Learn', icon: 'book-open', order: 3 },
          { id: 'calendar', label: 'Calendar', icon: 'calendar', order: 4 },
        ],
        gestures: []
      }
    case 'school-age':
      return {
        tabs: [
          { id: 'home', label: 'Home', icon: 'home', order: 1 },
          { id: 'school', label: 'School', icon: 'graduation-cap', order: 2 },
          { id: 'wallet', label: 'Wallet', icon: 'wallet', order: 3 },
          { id: 'screentime', label: 'Screen Time', icon: 'smartphone', order: 4 },
        ],
        gestures: []
      }
    case 'adolescence':
      return {
        tabs: [
          { id: 'home', label: 'Home', icon: 'home', order: 1 },
          { id: 'planner', label: 'Planner', icon: 'calendar-days', order: 2 },
          { id: 'wellbeing', label: 'Wellbeing', icon: 'heart', order: 3 },
          { id: 'profile', label: 'Profile', icon: 'user', order: 4 },
        ],
        gestures: []
      }
    default:
      return STAGE_CONFIGS['ttc_pregnancy']?.navigation || {
        tabs: [],
        gestures: []
      }
  }
}

/**
 * Get navigation configuration for child based on their stage
 */
export function getChildNavigationConfig(stage: ChildStage): NavigationConfig {
  return STAGE_CONFIGS[stage].navigation
}

/**
 * Determine if a stage transition should be triggered
 */
export function shouldTransitionStage(
  currentStage: ChildStage,
  dateOfBirth: Date,
  transitionBuffer: number = 14 // days
): {
  shouldTransition: boolean
  nextStage?: ChildStage
  daysUntilTransition?: number
} {
  const calculatedStage = calculateChildStage(dateOfBirth)
  
  if (currentStage === calculatedStage) {
    return { shouldTransition: false }
  }
  
  // Calculate when the transition should happen
  const now = new Date()
  const ageInMonths = (now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  
  let transitionAgeMonths: number
  switch (calculatedStage) {
    case 'toddler':
      transitionAgeMonths = 12
      break
    case 'early-childhood':
      transitionAgeMonths = 36
      break
    case 'school-age':
      transitionAgeMonths = 84
      break
    case 'adolescence':
      transitionAgeMonths = 156
      break
    default:
      return { shouldTransition: false }
  }
  
  const daysUntilTransition = (transitionAgeMonths - ageInMonths) * 30.44
  
  return {
    shouldTransition: daysUntilTransition <= transitionBuffer,
    nextStage: calculatedStage,
    daysUntilTransition: Math.max(0, Math.ceil(daysUntilTransition))
  }
}

/**
 * Get theme tokens for a specific stage
 */
export function getStageTheme(stage: ChildStage | ParentStage) {
  const config = getStageConfig(stage)
  if (!config) {
    // Fallback to default theme if config not found
    return {
      primary: '#4F8EF7',
      stage: stage,
      uiTheme: 'parent' as const,
    }
  }
  return {
    primary: config.primaryColor,
    stage: stage,
    uiTheme: config.uiTheme,
  }
}


/**
 * Format child age for display
 */
export function formatChildAge(dateOfBirth: Date): string {
  const now = new Date()
  const ageInMonths = Math.floor((now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  
  if (ageInMonths < 12) {
    return `${ageInMonths} months`
  } else if (ageInMonths < 24) {
    return `1 year ${ageInMonths - 12} months`
  } else {
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12
    return months > 0 ? `${years} years ${months} months` : `${years} years`
  }
}