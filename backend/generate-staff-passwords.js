const bcrypt = require('bcryptjs');

// Staff credentials with simple passwords
const staffCredentials = [
  { name: 'Vina', email: 'vina@cocolytics.com', password: 'Staff123' },
  { name: 'Paolo', email: 'paolo@cocolytics.com', password: 'Staff123' },
  { name: 'Bala', email: 'bala@cocolytics.com', password: 'Staff123' }
];

console.log('🔐 Generating bcrypt hashes for staff accounts...\n');

staffCredentials.forEach(staff => {
  const hash = bcrypt.hashSync(staff.password, 10);
  console.log(`Staff: ${staff.name}`);
  console.log(`Email: ${staff.email}`);
  console.log(`Password: ${staff.password}`);
  console.log(`Hash: ${hash}`);
  console.log(`SQL Insert:`);
  console.log(`INSERT INTO users (name, email, password, role) VALUES ('${staff.name}', '${staff.email}', '${hash}', 'staff');`);
  console.log('---\n');
});

console.log('✅ Use these hashes in your SQL setup file!');
