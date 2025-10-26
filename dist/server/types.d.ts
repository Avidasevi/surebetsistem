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
    status?: string;
    cor?: string;
    created_at: string;
}
export interface Aposta {
    id: string;
    banca_id: string;
    data_aposta: string;
    valor_apostado: number;
    casa_aposta: string;
    tipo_aposta: string;
    odd: number;
    resultado?: string;
    valor_recebido?: number;
    lucro: number;
    categoria?: string;
    esporte?: string;
    liga?: string;
    notas?: string;
    created_at: string;
}
export interface Calculo {
    id: string;
    user_id: string;
    tipo: string;
    odds: number[];
    stake: number[];
    resultado: any;
    created_at: string;
}
export interface Alerta {
    id: string;
    user_id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    lido: boolean;
    created_at: string;
}
export interface AuthUser {
    userId: string;
    email: string;
    isAdmin: boolean;
}
//# sourceMappingURL=types.d.ts.map