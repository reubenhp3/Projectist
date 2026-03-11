const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://obwnlsxcroxfalqllpcq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id25sc3hjcm94ZmFscWxscGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDQwNDgsImV4cCI6MjA4ODQyMDA0OH0.2coJ11bVHwlrv01Z0V-KFfxkZ278LeRp4JY7QFbcSO4'
);

module.exports = async (req, res) => {
  const from = req.body.From || '';
  const body = req.body.Body || '';

  // Clean phone number
  const phone = from.replace(/\D/g, '');

  // Look up customer by phone number
  const { data: customers } = await supabase
    .from('customers')
    .select('*, projects(*)')
    .ilike('phone', `%${phone.slice(-10)}%`);

  if (!customers || customers.length === 0) {
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
    return;
  }

  const customer = customers[0];
  const project = customer.projects && customer.projects[0];

  if (!project) {
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
    return;
  }

  // Save message to Supabase
  await supabase.from('messages').insert({
    project_id: project.id,
    customer_id: customer.id,
    sender_role: 'client',
    sender_name: customer.first_name + ' ' + customer.last_name,
    body: body,
    read_by_contractor: false,
    read_by_client: true
  });

  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
};