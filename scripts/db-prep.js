const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const dbUrl = process.env.DATABASE_URL || '';

console.log('--- Database Prep Script ---');
console.log('Current DATABASE_URL:', dbUrl ? '(is defined)' : '(not defined)');

if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at:', schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

let targetProvider = 'sqlite';
if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  targetProvider = 'postgresql';
}

console.log('Configuring database provider as:', targetProvider);

// Replace the provider in the datasource block
const datasourceRegex = /datasource\s+db\s*{[^}]*}/;
const newDatasource = `datasource db {
  provider = "${targetProvider}"
  url      = env("DATABASE_URL")
}`;

schema = schema.replace(datasourceRegex, newDatasource);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully updated schema.prisma!');
console.log('----------------------------');
process.exit(0);
