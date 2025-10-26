"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  AVISO: SUPABASE_URL e SUPABASE_ANON_KEY não estão definidas!');
    console.warn('⚠️  Configure as variáveis de ambiente no Render.com');
    console.warn('⚠️  O sistema funcionará em modo de demonstração');
}
exports.default = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
//# sourceMappingURL=supabase.js.map