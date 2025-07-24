import { prisma } from '@/lib/prisma'

interface PetCareSchedule {
  feedingCooldown: number // minutes between feedings
  playCooldown: number    // minutes between play sessions
  happinessDecayRate: number // happiness lost per hour
  energyDecayRate: number    // energy lost per hour
  sleepRegenRate: number     // energy gained per hour when sleeping
}

const DEFAULT_CARE_SCHEDULE: PetCareSchedule = {
  feedingCooldown: 120,      // 2 hours between feedings
  playCooldown: 60,          // 1 hour between play sessions
  happinessDecayRate: 2,     // lose 2 happiness per hour
  energyDecayRate: 3,        // lose 3 energy per hour
  sleepRegenRate: 5          // gain 5 energy per hour when sleeping
}

export class PetCareService {
  private static instance: PetCareService
  private schedule: PetCareSchedule

  private constructor(schedule: PetCareSchedule = DEFAULT_CARE_SCHEDULE) {
    this.schedule = schedule
  }

  static getInstance(): PetCareService {
    if (!PetCareService.instance) {
      PetCareService.instance = new PetCareService()
    }
    return PetCareService.instance
  }

  // Check if enough time has passed since last feeding
  canFeedPet(lastFed: Date): boolean {
    const now = new Date()
    const minutesSinceLastFed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60))
    return minutesSinceLastFed >= this.schedule.feedingCooldown
  }

  // Check if enough time has passed since last play
  canPlayWithPet(lastPlayed: Date): boolean {
    const now = new Date()
    const minutesSinceLastPlay = Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60))
    return minutesSinceLastPlay >= this.schedule.playCooldown
  }

  // Calculate happiness and energy decay based on time passed
  calculateDecay(pet: any): { happiness: number; energy: number; mood: string } {
    const now = new Date()
    
    // Calculate hours since last care
    const hoursSinceLastFed = Math.floor((now.getTime() - new Date(pet.lastFed).getTime()) / (1000 * 60 * 60))
    const hoursSinceLastPlayed = Math.floor((now.getTime() - new Date(pet.lastPlayed).getTime()) / (1000 * 60 * 60))
    
    // Calculate decay
    let newHappiness = pet.happiness
    let newEnergy = pet.energy
    
    // Happiness decays over time, faster if not played with recently
    const happinessDecay = Math.max(hoursSinceLastPlayed * this.schedule.happinessDecayRate, 0)
    newHappiness = Math.max(0, newHappiness - happinessDecay)
    
    // Energy decays over time, but regenerates if sleeping (low energy + recent feeding)
    if (newEnergy < 30 && hoursSinceLastFed < 4) {
      // Pet is sleeping and well-fed, regenerate energy
      const energyRegen = Math.min(hoursSinceLastFed * this.schedule.sleepRegenRate, 0)
      newEnergy = Math.min(100, newEnergy + energyRegen)
    } else {
      // Normal energy decay
      const energyDecay = Math.max(hoursSinceLastFed * this.schedule.energyDecayRate, 0)
      newEnergy = Math.max(0, newEnergy - energyDecay)
    }
    
    // Determine mood based on current stats and care history
    let newMood = this.calculateMood(newHappiness, newEnergy, hoursSinceLastFed, hoursSinceLastPlayed)
    
    return {
      happiness: Math.round(newHappiness),
      energy: Math.round(newEnergy),
      mood: newMood
    }
  }

  private calculateMood(happiness: number, energy: number, hoursSinceLastFed: number, hoursSinceLastPlayed: number): string {
    // Sleeping if very low energy
    if (energy < 20) {
      return 'sleeping'
    }
    
    // Excited if high happiness and energy
    if (happiness > 80 && energy > 70) {
      return 'excited'
    }
    
    // Happy if good stats and recent care
    if (happiness > 60 && energy > 50) {
      return 'happy'
    }
    
    // Sad if neglected or low stats
    if (happiness < 40 || hoursSinceLastFed > 8 || hoursSinceLastPlayed > 6) {
      return 'sad'
    }
    
    // Neutral default
    return 'neutral'
  }

  // Get time remaining until next feeding/play is allowed
  getNextCareTime(lastFed: Date, lastPlayed: Date): { 
    nextFeeding: Date | null; 
    nextPlay: Date | null;
    canFeedNow: boolean;
    canPlayNow: boolean;
  } {
    const now = new Date()
    
    const canFeedNow = this.canFeedPet(lastFed)
    const canPlayNow = this.canPlayWithPet(lastPlayed)
    
    const nextFeeding = canFeedNow ? null : new Date(lastFed.getTime() + (this.schedule.feedingCooldown * 60 * 1000))
    const nextPlay = canPlayNow ? null : new Date(lastPlayed.getTime() + (this.schedule.playCooldown * 60 * 1000))
    
    return {
      nextFeeding,
      nextPlay,
      canFeedNow,
      canPlayNow
    }
  }

  // Calculate feeding/play bonuses based on timing
  calculateCareBonus(timeSinceLastCare: number, careType: 'feed' | 'play'): number {
    // Bonus multiplier for caring at the right time (not too early, not too late)
    const optimalWindow = careType === 'feed' ? this.schedule.feedingCooldown : this.schedule.playCooldown
    const timingRatio = timeSinceLastCare / optimalWindow
    
    if (timingRatio < 0.8) {
      // Too early, reduced effectiveness
      return 0.5
    } else if (timingRatio <= 1.5) {
      // Optimal timing
      return 1.0
    } else if (timingRatio <= 3.0) {
      // Late but still good
      return 1.2
    } else {
      // Very late, pet is suffering, big bonus for caring
      return 1.5
    }
  }

  // Update pet stats with proper care logic
  async feedPet(petId: string): Promise<any> {
    const pet = await prisma.virtualPet.findUnique({ where: { id: petId } })
    if (!pet) throw new Error('Pet not found')

    const now = new Date()
    const minutesSinceLastFed = Math.floor((now.getTime() - pet.lastFed.getTime()) / (1000 * 60))
    
    if (!this.canFeedPet(pet.lastFed)) {
      const minutesUntilNext = this.schedule.feedingCooldown - minutesSinceLastFed
      throw new Error(`Pet isn't hungry yet! Try again in ${minutesUntilNext} minutes.`)
    }

    // Apply decay first
    const decayed = this.calculateDecay(pet)
    
    // Calculate care bonus
    const bonus = this.calculateCareBonus(minutesSinceLastFed, 'feed')
    
    // Apply feeding effects with bonus
    const happinessGain = Math.round(15 * bonus)
    const energyGain = Math.round(10 * bonus)
    
    const newHappiness = Math.min(100, decayed.happiness + happinessGain)
    const newEnergy = Math.min(100, decayed.energy + energyGain)
    const newMood = this.calculateMood(newHappiness, newEnergy, 0, minutesSinceLastFed)

    return await prisma.virtualPet.update({
      where: { id: petId },
      data: {
        happiness: newHappiness,
        energy: newEnergy,
        mood: newMood,
        lastFed: now
      }
    })
  }

  async playWithPet(petId: string): Promise<any> {
    const pet = await prisma.virtualPet.findUnique({ where: { id: petId } })
    if (!pet) throw new Error('Pet not found')

    const now = new Date()
    const minutesSinceLastPlayed = Math.floor((now.getTime() - pet.lastPlayed.getTime()) / (1000 * 60))
    
    if (!this.canPlayWithPet(pet.lastPlayed)) {
      const minutesUntilNext = this.schedule.playCooldown - minutesSinceLastPlayed
      throw new Error(`Pet is still tired from last play session! Try again in ${minutesUntilNext} minutes.`)
    }

    // Apply decay first
    const decayed = this.calculateDecay(pet)
    
    // Can't play if pet is too tired
    if (decayed.energy < 20) {
      throw new Error('Pet is too tired to play! Try feeding first.')
    }

    // Calculate care bonus
    const bonus = this.calculateCareBonus(minutesSinceLastPlayed, 'play')
    
    // Apply play effects with bonus
    const happinessGain = Math.round(20 * bonus)
    const energyCost = Math.round(15 / bonus) // Less energy cost if well-timed
    
    const newHappiness = Math.min(100, decayed.happiness + happinessGain)
    const newEnergy = Math.max(0, decayed.energy - energyCost)
    const newMood = this.calculateMood(newHappiness, newEnergy, 0, 0)

    return await prisma.virtualPet.update({
      where: { id: petId },
      data: {
        happiness: newHappiness,
        energy: newEnergy,
        mood: newMood,
        lastPlayed: now,
        // Add XP for playing
        xp: { increment: Math.round(5 * bonus) }
      }
    })
  }

  // Update all pets' decay (could be called by a cron job)
  async updateAllPetsDecay(): Promise<void> {
    const pets = await prisma.virtualPet.findMany()
    
    for (const pet of pets) {
      const decayed = this.calculateDecay(pet)
      
      // Only update if there's been actual decay
      if (
        decayed.happiness !== pet.happiness || 
        decayed.energy !== pet.energy || 
        decayed.mood !== pet.mood
      ) {
        await prisma.virtualPet.update({
          where: { id: pet.id },
          data: {
            happiness: decayed.happiness,
            energy: decayed.energy,
            mood: decayed.mood
          }
        })
      }
    }
  }
}