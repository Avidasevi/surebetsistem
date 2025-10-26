export interface OddsApiSport {
  key: string;
  title: string;
  active: boolean;
}

export interface OddsApiMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string;
  price: number;
}

export interface Surebet {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  profit: number;
  odds: SurebetOdd[];
  commenceTime: string;
  totalImpliedProbability: number;
}

export interface SurebetOdd {
  outcome: string;
  bookmaker: string;
  odd: number;
  impliedProbability: number;
}

class OddsApiService {
  private apiKey: string;
  private baseUrl = 'https://api.the-odds-api.com/v4';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSports(): Promise<OddsApiSport[]> {
    const response = await fetch(`${this.baseUrl}/sports/?apiKey=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar esportes: ${response.statusText}`);
    }
    return response.json();
  }

  async getOdds(sportKey: string): Promise<OddsApiMatch[]> {
    const response = await fetch(
      `${this.baseUrl}/sports/${sportKey}/odds/?apiKey=${this.apiKey}&regions=us,uk,eu&markets=h2h&oddsFormat=decimal`
    );
    if (!response.ok) {
      throw new Error(`Erro ao buscar odds para ${sportKey}: ${response.statusText}`);
    }
    return response.json();
  }

  findSurebets(matches: OddsApiMatch[]): Surebet[] {
    const surebets: Surebet[] = [];
    
    matches.forEach((match) => {
      if (!match.bookmakers || match.bookmakers.length < 2) return;
      
      const outcomes = ['home', 'away', 'draw'];
      const bestOdds: { [key: string]: { odd: number; bookmaker: string } } = {};
      
      outcomes.forEach(outcome => {
        let bestOdd = 0;
        let bestBookmaker = '';
        
        match.bookmakers.forEach((bookmaker) => {
          const market = bookmaker.markets?.find((m) => m.key === 'h2h');
          if (market) {
            let outcomeData;
            
            if (outcome === 'home') {
              outcomeData = market.outcomes?.find((o) => o.name === match.home_team);
            } else if (outcome === 'away') {
              outcomeData = market.outcomes?.find((o) => o.name === match.away_team);
            } else if (outcome === 'draw') {
              outcomeData = market.outcomes?.find((o) => o.name === 'Draw');
            }
            
            if (outcomeData && outcomeData.price > bestOdd) {
              bestOdd = outcomeData.price;
              bestBookmaker = bookmaker.title;
            }
          }
        });
        
        if (bestOdd > 0) {
          bestOdds[outcome] = { odd: bestOdd, bookmaker: bestBookmaker };
        }
      });
      
      const validOutcomes = Object.keys(bestOdds);
      if (validOutcomes.length >= 2) {
        const impliedProbabilities = validOutcomes.map(outcome => 1 / bestOdds[outcome].odd);
        const totalImpliedProbability = impliedProbabilities.reduce((sum, prob) => sum + prob, 0);
        
        if (totalImpliedProbability < 1) {
          const profit = ((1 / totalImpliedProbability) - 1) * 100;
          
          if (profit > 0.1) {
            surebets.push({
              id: `${match.id}-${Date.now()}`,
              sport: match.sport_title,
              league: match.sport_title,
              homeTeam: match.home_team,
              awayTeam: match.away_team,
              profit: Number(profit.toFixed(3)),
              totalImpliedProbability: Number(totalImpliedProbability.toFixed(4)),
              odds: validOutcomes.map(outcome => ({
                outcome: outcome === 'home' ? match.home_team : 
                        outcome === 'away' ? match.away_team : 'Empate',
                bookmaker: bestOdds[outcome].bookmaker,
                odd: bestOdds[outcome].odd,
                impliedProbability: Number((1 / bestOdds[outcome].odd).toFixed(4))
              })),
              commenceTime: match.commence_time
            });
          }
        }
      }
    });
    
    return surebets.sort((a, b) => b.profit - a.profit);
  }

  calculateOptimalStakes(surebet: Surebet, totalStake: number): { [outcome: string]: number } {
    const stakes: { [outcome: string]: number } = {};
    
    surebet.odds.forEach(odd => {
      stakes[odd.outcome] = Number((totalStake * odd.impliedProbability).toFixed(2));
    });
    
    return stakes;
  }
}

export default OddsApiService;