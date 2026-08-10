const fs = require('fs');

async function main() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/CLERK_SECRET_KEY=([^\r\n]+)/);
  if (!match) {
    console.log('No key found');
    return;
  }
  const secretKey = match[1].trim();

  // 1. Fetch Users
  const res = await fetch('https://api.clerk.com/v1/users?limit=500', {
    headers: { 'Authorization': 'Bearer ' + secretKey }
  });
  const users = await res.json();
  
  if (!Array.isArray(users)) {
    console.log('Failed to fetch users:', users);
    return;
  }

  let targetUser = null;
  for (const u of users) {
    for (const emailObj of u.email_addresses) {
      if (emailObj.email_address.toLowerCase() === 'isabelabadinitattoorj@gmail.com') {
        targetUser = u;
        break;
      }
    }
  }

  if (!targetUser) {
    console.log('Isabela not found in Clerk users.');
    // List available emails
    console.log('Available emails:');
    users.forEach(u => {
      console.log(u.email_addresses.map(e => e.email_address).join(', '));
    });
    return;
  }

  console.log('Found Isabela! ID:', targetUser.id);

  // 2. Update Role to Admin
  const updateRes = await fetch(`https://api.clerk.com/v1/users/${targetUser.id}/metadata`, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + secretKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      public_metadata: {
        role: 'Admin'
      }
    })
  });

  const updated = await updateRes.json();
  console.log('Updated user role. Success?', !!updated.id);
  if (!updated.id) {
    console.log(updated);
  } else {
    console.log('Current public metadata:', updated.public_metadata);
  }
}

main();
