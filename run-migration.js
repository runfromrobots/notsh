const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    const migrationFile = process.argv[2] || 'migrations/004_add_step_tracking.sql'
    const sql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf-8')

    console.log(`Running migration: ${migrationFile}`)
    console.log(sql)

    // Use Supabase's query builder to execute raw SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql })

    if (error) {
      console.error('Migration error:', error)
      process.exit(1)
    }

    console.log('Migration completed successfully')
  } catch (err) {
    console.error('Failed to run migration:', err)
    process.exit(1)
  }
}

runMigration()
