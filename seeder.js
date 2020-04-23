const fs        = require('fs')
const mongoose  = require('mongoose')
const colours   = require('colors')
const dotenv    = require('dotenv')

// files
dotenv.config({ path: './config/config.env' })
const Bootcamp  = require('./models/Bootcamp')

// DB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Importing data
const importData = async() => {
    const bootcamps = JSON.parse(
      fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
    );

    try {
        await Bootcamp.create(bootcamps)

        console.log('[database] Data imported...'.cyan.bold.underline)
        process.exit()
    } catch (error) {
        console.error(error.red)
    }
}

// Deleting data
const deleteData = async() => {
    try {
        await Bootcamp.deleteMany()

        console.log('[database] Data destroyed...'.cyan.bold.underline)
        process.exit()
    } catch (error) {
        console.error(error.red)
    }
}

if (process.argv[2] === "-i" || process.argv[2]  === "--import") {
    importData()
} else if (process.argv[2] === "-d" || process.argv[2] === "--delete") {
    deleteData()
}