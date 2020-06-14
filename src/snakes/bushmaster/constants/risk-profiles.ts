export type RiskProfileNames = 'normal'

export type RiskCategories = 'playerDead' | 'playerHealth' | 'enemyHealth' | 'relativeLength' | 'enemyCount' | 'smallSnakeProximity' | 'dangerSnakeProximity' | 'killBonus' | 'hungry' | 'starving' | 'win'

export interface RiskProfile {
  playerDead: {
    impact: number
  },

  playerHealth: {
    impact: number
  },

  enemyHealth: {
    impact: number
  },

  relativeLength: {
    impact: number
    max: number,
    min: number
  },

  enemyCount: {
    impact: number
  },

  smallSnakeProximity: {
    impact: number
  },

  dangerSnakeProximity: {
    impact: number
  },

  killBonus: {
    impact: number
  },

  hungry: {
    impact: number
    threshold: number
  },

  starving: {
    impact: number
    threshold: number
  },

  win: {
    impact: number
  }
}

const normal: RiskProfile = {
  playerDead: {
    impact: -9000,
  },

  playerHealth: {
    impact: 1,
  },

  enemyHealth: {
    impact: -0.5,
  },

  relativeLength: {
    impact: 10,
    max: 20,
    min: -20
  },

  enemyCount: {
    impact: -20,
  },

  smallSnakeProximity: {
    impact: 200
  },

  dangerSnakeProximity: {
    impact: -400
  },

  killBonus: {
    impact: 200
  },

  hungry: {
    impact: -100,
    threshold: 20
  },

  starving: {
    impact: -200,
    threshold: 10
  },

  win: {
    impact: 10000
  }
}

const riskProfiles: { [key in RiskProfileNames]: RiskProfile} = { normal }

export default riskProfiles