// src/lib/supabase.js
// ══════════════════════════════════════════════════
//  Supabase Client — يُستخدم في كل التطبيق
// ══════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;
let isMock = false;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing. Using Mock Mode.');
  isMock = true;
} else {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = supabaseInstance;

// Mock Data Store
const mockStore = {
  teachers: [
    { id: 1, name: 'أحمد محمد العنزي', subject: 'الرياضيات', dept: 'العلوم' },
    { id: 2, name: 'فاطمة يوسف الرشيد', subject: 'اللغة العربية', dept: 'الآداب' },
    { id: 3, name: 'خالد عبدالله المطيري', subject: 'العلوم', dept: 'العلوم' },
  ],
  evaluations: [],
  users: [
    { id: 1, username: 'admin', password: '123', role: 'admin', full_name: 'مدير النظام' },
    { id: 2, username: 'visitor', password: '123', role: 'visitor', full_name: 'زائر' }
  ]
};

// ── Teachers API ──────────────────────────────────
export const teachersAPI = {
  async getAll() {
    if (isMock) {
      return [...mockStore.teachers];
    }
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async create(teacher) {
    if (isMock) {
      const newTeacher = { ...teacher, id: Date.now() };
      mockStore.teachers.push(newTeacher);
      return newTeacher;
    }
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacher])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    if (isMock) {
      const idx = mockStore.teachers.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Not found');
      mockStore.teachers[idx] = { ...mockStore.teachers[idx], ...updates };
      return mockStore.teachers[idx];
    }
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    if (isMock) {
      mockStore.teachers = mockStore.teachers.filter(t => t.id !== id);
      return;
    }
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

// ── Evaluations API ───────────────────────────────
export const evaluationsAPI = {
  async getAll(filters = {}) {
    if (isMock) {
      let res = [...mockStore.evaluations];
      if (filters.teacher_name) res = res.filter(r => r.teacher_name.includes(filters.teacher_name));
      if (filters.date) res = res.filter(r => r.date === filters.date);
      if (filters.subject) res = res.filter(r => r.subject === filters.subject);
      if (filters.class_section) res = res.filter(r => r.class_section === filters.class_section);
      return res.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    let query = supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.teacher_name)
      query = query.ilike('teacher_name', `%${filters.teacher_name}%`)
    if (filters.date)
      query = query.eq('date', filters.date)
    if (filters.subject)
      query = query.eq('subject', filters.subject)
    if (filters.class_section)
      query = query.eq('class_section', filters.class_section)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(evaluation) {
    if (isMock) {
      const newEval = { ...evaluation, id: Date.now(), created_at: new Date().toISOString() };
      mockStore.evaluations.push(newEval);
      return newEval;
    }
    const { data, error } = await supabase
      .from('evaluations')
      .insert([evaluation])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    if (isMock) {
      mockStore.evaluations = mockStore.evaluations.filter(e => e.id !== id);
      return;
    }
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

// ── Auth API (simple, no JWT) ─────────────────────
export const authAPI = {
  async login(username, password) {
    if (isMock) {
      const user = mockStore.users.find(u => u.username === username.toLowerCase().trim() && u.password === password);
      return user || null;
    }
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .eq('password', password)
      .single()
    if (error || !data) return null
    return data
  },
}
