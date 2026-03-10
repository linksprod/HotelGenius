import https from 'https';

const projectRef = "qvhthjtdzeerafabfbfc";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";
const url = `https://${projectRef}.functions.supabase.co/process-notification`;

const data = JSON.stringify({
    record: {
        notification_id: `test-${Date.now()}`,
        type: 'booking_confirmed',
        recipient_id: 'cb6315aa-7f1b-4285-b113-16ba6e6fac3e',
        hotel_id: '00000000-0000-0000-0000-000000000000',
        title: 'Bypass RPC Test',
        body: 'This should be sent via email even if RPC fails.',
        status: 'pending',
        reference_id: 'fc1133b1-9f22-4456-ae00-1617a87bd6f3',
        reference_type: 'TableReservation'
    },
    bypass_rpc: true,
    forced_channels: ['email']
});

const options = {
    hostname: `${projectRef}.functions.supabase.co`,
    port: 443,
    path: '/process-notification',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log(`Invoking ${url} with bypass_rpc...`);

const req = https.request(options, res => {
    console.log(`Status Code: ${res.statusCode}`);
    let body = '';
    res.on('data', d => {
        body += d;
    });
    res.on('end', () => {
        console.log('Response body:', body);
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
