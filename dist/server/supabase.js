"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
}
exports.default = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
//# sourceMappingURL=supabase.js.map