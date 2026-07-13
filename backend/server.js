require('dotenv').config();
const { connectDB } = require('./src/db');
const app = require('./src/app');
const config = require('./src/config');

async function main() {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      console.log(`🚀 Resume Insight API running on http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
