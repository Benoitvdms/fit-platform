export const SPORTS_CATEGORIES = {
  strength_training: {
    name: 'Strength Training',
    subcategories: [
      'powerlifting',
      'bodybuilding',
      'crossfit',
      'functional_training',
      'calisthenics',
      'olympic_weightlifting'
    ]
  },
  cardio: {
    name: 'Cardio',
    subcategories: [
      'running',
      'cycling',
      'rowing',
      'swimming',
      'hiit',
      'circuit_training',
      'jump_rope'
    ]
  },
  combat_sports: {
    name: 'Combat Sports',
    subcategories: [
      'boxing',
      'kickboxing',
      'muay_thai',
      'taekwondo',
      'karate',
      'jiu_jitsu',
      'mma',
      'kung_fu',
      'judo',
      'krav_maga'
    ]
  },
  yoga_pilates: {
    name: 'Yoga & Pilates',
    subcategories: [
      'hatha_yoga',
      'vinyasa_yoga',
      'ashtanga_yoga',
      'bikram_yoga',
      'yin_yoga',
      'power_yoga',
      'pilates_mat',
      'pilates_reformer'
    ]
  },
  dance_fitness: {
    name: 'Dance & Fitness',
    subcategories: [
      'zumba',
      'hip_hop',
      'ballet_fitness',
      'salsa',
      'bollywood',
      'contemporary',
      'latin_dance',
      'aerobics'
    ]
  },
  team_sports: {
    name: 'Team Sports',
    subcategories: [
      'basketball',
      'football',
      'soccer',
      'volleyball',
      'baseball',
      'hockey',
      'rugby',
      'tennis',
      'badminton',
      'table_tennis'
    ]
  },
  outdoor_sports: {
    name: 'Outdoor Sports',
    subcategories: [
      'hiking',
      'rock_climbing',
      'surfing',
      'skiing',
      'snowboarding',
      'mountain_biking',
      'trail_running',
      'kayaking',
      'paddleboarding'
    ]
  },
  flexibility_mobility: {
    name: 'Flexibility & Mobility',
    subcategories: [
      'stretching',
      'foam_rolling',
      'mobility_drills',
      'recovery_sessions',
      'meditation',
      'breathing_exercises'
    ]
  },
  specialized_training: {
    name: 'Specialized Training',
    subcategories: [
      'rehabilitation',
      'senior_fitness',
      'prenatal_fitness',
      'youth_training',
      'athlete_training',
      'injury_prevention'
    ]
  }
} as const

export type MainCategory = keyof typeof SPORTS_CATEGORIES
export type SubCategory = typeof SPORTS_CATEGORIES[MainCategory]['subcategories'][number]

export const getAllSubcategories = (): string[] => {
  return Object.values(SPORTS_CATEGORIES).flatMap(category => category.subcategories)
}