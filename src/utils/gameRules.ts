// Types for game rules
export interface GameRule {
    id: string
    name: string
    description: string
    condition: (gameState: GameState) => boolean
    trigger: 'onMove' | 'onReceive' | 'onTurnStart' | 'onTurnEnd'
    priority: number
}

export interface GameState {
    piles: number[]
    currentPlayer: 1 | 2
    lastMove?: {
        player: 1 | 2
        pileIndex: number
        coinsTaken: number
    }
    moveHistory: Array<{
        player: 1 | 2
        pileIndex: number
        coinsTaken: number
        resultingPiles: number[]
    }>
}

// Built-in rule templates
export const ruleTemplates = {
    multipleOf: (number: number): GameRule => ({
        id: `multiple-of-${number}`,
        name: `Multiple of ${number}`,
        description: `Player loses if they leave a multiple of ${number}`,
        condition: (state: GameState) => {
            const lastPile = state.piles[state.lastMove?.pileIndex ?? 0]
            return lastPile % number === 0
        },
        trigger: 'onMove',
        priority: 1
    }),

    specificNumber: (number: number): GameRule => ({
        id: `specific-number-${number}`,
        name: `Specific Number ${number}`,
        description: `Player loses if they receive a pile of size ${number}`,
        condition: (state: GameState) => {
            return state.piles.some(pile => pile === number)
        },
        trigger: 'onReceive',
        priority: 1
    }),

    consecutiveMoves: (count: number): GameRule => ({
        id: `consecutive-moves-${count}`,
        name: `Consecutive Moves ${count}`,
        description: `Player loses if they make ${count} consecutive moves`,
        condition: (state: GameState) => {
            const recentMoves = state.moveHistory.slice(-count)
            return recentMoves.length === count &&
                recentMoves.every(move => move.player === state.currentPlayer)
        },
        trigger: 'onTurnEnd',
        priority: 2
    }),

    sumOfPiles: (target: number): GameRule => ({
        id: `sum-of-piles-${target}`,
        name: `Sum of Piles ${target}`,
        description: `Player loses if the sum of all piles equals ${target}`,
        condition: (state: GameState) => {
            return state.piles.reduce((sum, pile) => sum + pile, 0) === target
        },
        trigger: 'onMove',
        priority: 1
    }),

    differenceBetweenPiles: (target: number): GameRule => ({
        id: `pile-difference-${target}`,
        name: `Pile Difference ${target}`,
        description: `Player loses if the difference between any two piles equals ${target}`,
        condition: (state: GameState) => {
            for (let i = 0; i < state.piles.length; i++) {
                for (let j = i + 1; j < state.piles.length; j++) {
                    if (Math.abs(state.piles[i] - state.piles[j]) === target) {
                        return true
                    }
                }
            }
            return false
        },
        trigger: 'onMove',
        priority: 1
    })
}

// Rule combination templates
export const ruleCombinations = {
    and: (rules: GameRule[]): GameRule => ({
        id: `and-${rules.map(r => r.id).join('-')}`,
        name: `All of: ${rules.map(r => r.name).join(', ')}`,
        description: `Player loses if ALL conditions are met`,
        condition: (state: GameState) => rules.every(rule => rule.condition(state)),
        trigger: 'onMove',
        priority: Math.max(...rules.map(r => r.priority))
    }),

    or: (rules: GameRule[]): GameRule => ({
        id: `or-${rules.map(r => r.id).join('-')}`,
        name: `Any of: ${rules.map(r => r.name).join(', ')}`,
        description: `Player loses if ANY condition is met`,
        condition: (state: GameState) => rules.some(rule => rule.condition(state)),
        trigger: 'onMove',
        priority: Math.max(...rules.map(r => r.priority))
    })
}

// Custom rule builder
export class RuleBuilder {
    private rules: GameRule[] = []

    addRule(rule: GameRule): RuleBuilder {
        this.rules.push(rule)
        return this
    }

    addTemplate(template: keyof typeof ruleTemplates, ...args: any[]): RuleBuilder {
        this.rules.push(ruleTemplates[template](...args))
        return this
    }

    combineAnd(): GameRule {
        return ruleCombinations.and(this.rules)
    }

    combineOr(): GameRule {
        return ruleCombinations.or(this.rules)
    }

    getRules(): GameRule[] {
        return this.rules
    }
}

// Example usage:
/*
const customRules = new RuleBuilder()
  .addTemplate('multipleOf', 5)
  .addTemplate('specificNumber', 23)
  .addTemplate('consecutiveMoves', 3)
  .combineOr()

const complexRule = new RuleBuilder()
  .addTemplate('sumOfPiles', 50)
  .addTemplate('differenceBetweenPiles', 10)
  .combineAnd()
*/ 