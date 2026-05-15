const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://huwbynglsvukjfhpnyld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2J5bmdsc3Z1a2pmaHBueWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDMyMzYsImV4cCI6MjA5NDIxOTIzNn0.nXnAvQxCApFGPoJ-_EJZ-71iOQ_z4OT5bIQQuZXRJQQ'
);

async function seed() {
  // 1. Sign in
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'jmyeo1214@gmail.com',
    password: '123456',
  });
  if (authErr) { console.error('Auth failed:', authErr); return; }
  console.log('Signed in.');

  // 2. Insert customers
  const { data: customers, error: custErr } = await supabase.from('customers').insert([
    { customer_name: 'ABC Poultry Corp', farm_name: 'Tarlac Farm Site A', region: 'Central Luzon', contact_name: 'Juan Dela Cruz' },
    { customer_name: 'Golden Egg Farms', farm_name: 'Bulacan Layer House', region: 'Central Luzon', contact_name: 'Maria Santos' },
  ]).select();

  if (custErr) { console.error('Customer insert error:', custErr); return; }
  console.log('Customers inserted:', customers.length);

  const cust1 = customers[0].id;
  const cust2 = customers[1].id;

  // 3. Insert flocks
  const { data: flocks, error: flockErr } = await supabase.from('flocks').insert([
    { customer_id: cust1, breed: 'Hy-Line Brown', placement_date: '2025-01-15', initial_birds: 50000 },
    { customer_id: cust1, breed: 'Lohmann Brown', placement_date: '2025-03-01', initial_birds: 30000 },
    { customer_id: cust2, breed: 'ISA Brown', placement_date: '2025-02-10', initial_birds: 40000 },
  ]).select();

  if (flockErr) { console.error('Flock insert error:', flockErr); return; }
  console.log('Flocks inserted:', flocks.length);

  const flock1 = flocks[0]; // Hy-Line Brown, 50000
  const flock2 = flocks[1]; // Lohmann Brown, 30000
  const flock3 = flocks[2]; // ISA Brown, 40000

  // 4. Generate 30 days of daily records for each flock
  const today = new Date();
  const records = [];

  for (const flock of [flock1, flock2, flock3]) {
    let birds = flock.initial_birds;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Simulate realistic data
      const prevBirds = birds;
      const mortality = Math.floor(Math.random() * 15) + 2; // 2-16 per day
      birds = prevBirds - mortality;
      const currentBirds = birds;

      // HD ratio gradually increases from ~60% to ~85% over 30 days (production ramp)
      const dayIndex = 30 - i;
      const baseHd = 60 + (dayIndex / 30) * 25;
      const hdNoise = (Math.random() - 0.5) * 6;
      const eggCount = Math.round(currentBirds * (baseHd + hdNoise) / 100);

      const hdRatio = Math.round((eggCount / currentBirds) * 10000) / 100;
      const hhRatio = Math.round((eggCount / flock.initial_birds) * 10000) / 100;

      // Feed: ~110-120g per bird
      const feedPerBird = 110 + Math.random() * 10;
      const feedKg = Math.round((currentBirds * feedPerBird) / 1000 * 100) / 100;
      const avgFeedG = Math.round(feedPerBird * 100) / 100;

      records.push({
        flock_id: flock.id,
        record_date: dateStr,
        previous_birds: prevBirds,
        mortality,
        current_birds: currentBirds,
        feed_kg: feedKg,
        egg_count: eggCount,
        hd_ratio: hdRatio,
        hh_ratio: hhRatio,
        avg_feed_g: avgFeedG,
        memo: null,
      });
    }
  }

  // Insert in batches of 30
  for (let i = 0; i < records.length; i += 30) {
    const batch = records.slice(i, i + 30);
    const { error: recErr } = await supabase.from('daily_records').insert(batch);
    if (recErr) {
      console.error('Record insert error at batch', i, ':', recErr);
      return;
    }
  }

  console.log('Daily records inserted:', records.length);
  console.log('Seed complete!');
}

seed();
