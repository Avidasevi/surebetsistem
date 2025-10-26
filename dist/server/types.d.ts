export interface User {
    id: string;
    email: string;
    password: string;
    nome?: string;
    plano?: string;
    aprovado: boolean;
    is_admin: boolean;
    created_at: string;
    aprovado_em?: string;
    aprovado_por?: string;
}
export interface Banca {
    id: string;
    user_id: string;
    nome: string;
    valor_inicial: number;
    saldo_atual: number;
    meta_valor?: number;
    meta_percentual?: number;
    status: 'ativa' | 'pausada' | 'finalizada';
    created_at: string;
    updated_at: string;
}
export interface Aposta {
    id: string;
    banca_id: string;
    data_aposta: string;
    valor_apostado: number;
    casa_aposta: string;
    tipo_aposta: string;
    odd: number;
    resultado: 'ganhou' | 'perdeu' | 'empate';
    valor_recebido: number;
    lucro: number;
    created_at: string;
    banca_nome?: string;
}
export interface Calculo {
    id: string;
    user_id: string;
    tipo: '2_resultados' | '3_resultados' | 'arbitragem' | 'value_bet';
    odds: number[];
    stake: number;
    resultado: any;
    created_at: string;
}
export interface Alerta {
    id: string;
    user_id: string;
    tipo: 'surebet' | 'value_bet' | 'meta' | 'stop_loss';
    mensagem: string;
    lida: boolean;
    created_at: string;
}
export interface DashboardStats {
    totalBancas: number;
    saldoTotal: number;
    lucroTotal: number;
    roi: number;
}
export interface ChartData {
    date: string;
    lucro: number;
    volume: number;
}
export interface AdminStats {
    totalUsers: number;
    totalBancas: number;
    totalApostas: number;
    volumeTotal: number;
    lucroTotal: number;
}
//# sourceMappingURL=types.d.ts.map