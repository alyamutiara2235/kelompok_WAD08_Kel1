import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


router.post('/register', async (req, res) => {
  const { email_kampus, password, nama, nim } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email_kampus,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          nama,
          nim,
          email_kampus,
          role: 'user',
        },
      ]);

      if (profileError) return res.status(400).json({ error: profileError.message });
    }

    return res.status(201).json({ message: 'Registrasi berhasil', user: authData.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email_kampus, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email_kampus,
      password,
    });

    if (error) return res.status(400).json({ error: error.message });

   
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.status(200).json({
      message: 'Login berhasil',
      token: data.session?.access_token,
      user: profile,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;