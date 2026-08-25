import postgres from 'postgres';
const sql = postgres('postgresql://postgres:yBXsYBsFbmohboshHlpurqqOKQuHHbxG@hayabusa.proxy.rlwy.net:18344/railway', {connect_timeout: 5, idle_timeout: 5});
try {
  const r = await sql.unsafe('SELECT 1 as test');
  console.log('DB OK:', JSON.stringify(r));
} catch(e) {
  console.log('DB ERR:', e.message);
}
process.exit(0);
