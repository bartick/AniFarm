import DatabaseConstructor, {Database} from 'better-sqlite3';

const db: Database = new DatabaseConstructor('./data/database.db');
console.log('Connected to sqlite db');

export default db;