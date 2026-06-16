import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SEED_PROFILE = {
  substances: [
    { name: 'Coffee', frequency: 'daily', notes: 'Probably affecting stomach pH' },
    { name: 'Cannabis', frequency: 'daily', notes: 'Daily use, vaping. Started ~10 years ago.' },
    { name: 'Tobacco/Vape', frequency: 'daily', notes: 'Lung health concern. Spirometry pending.' },
    { name: 'Sertraline', frequency: 'daily', notes: '50mg nightly' },
    { name: 'Concerta', frequency: 'daily', notes: 'Methylphenidate ER — ADHD' },
    { name: 'Psilocybin', frequency: 'microdosing', notes: 'Intermittent microdosing' },
    { name: 'L-Theanine', frequency: 'daily', notes: '200mg with coffee' },
  ],
  conditions: [
    { name: 'ADHD', status: 'diagnosed', notes: '' },
    { name: 'Autism', status: 'diagnosed', notes: '' },
    { name: 'Bunion (big toe)', status: 'active', notes: 'Right foot' },
    { name: 'Low SpO2', status: 'monitoring', notes: '92-100% range. Possibly smoking related.' },
    { name: 'Stomach pH / acid', status: 'concern', notes: 'Coffee + smoking likely contributing' },
  ],
  pendingTests: [
    { name: 'Liver Panel', location: 'LifeLabs', status: 'pending', notes: '' },
    { name: 'Thyroid Panel', location: 'LifeLabs', status: 'pending', notes: '' },
    { name: 'Full Blood Panel (CBC, lipids, heart markers)', location: 'LifeLabs', status: 'pending', notes: '' },
    { name: 'Spirometry (lung function)', location: 'TBD', status: 'pending', notes: 'Smoking-related lung function concern' },
    { name: 'Cognitive / brain health baseline', location: 'TBD', status: 'pending', notes: 'Weed/vape since ~age 16' },
  ],
  notes: 'Currently tracking blood pressure and resting heart rate trends. Cessation support options exist for smoking — ask doctor.',
};

const EMPTY_PROFILE = { substances: [], conditions: [], pendingTests: [], notes: '' };

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('dose_profiles')
      .select('data')
      .eq('id', user.id)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          await supabase.from('dose_profiles').insert({ id: user.id, data: SEED_PROFILE });
          setProfile(SEED_PROFILE);
        } else {
          setProfile(data.data);
        }
        setProfileLoading(false);
      });
  }, [user]);

  async function saveProfile(next) {
    setProfile(next);
    await supabase
      .from('dose_profiles')
      .upsert({ id: user.id, data: next, updated_at: new Date().toISOString() });
  }

  return { profile, saveProfile, profileLoading };
}
