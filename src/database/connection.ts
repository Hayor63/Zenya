import config from "config";
import mongoose from "mongoose";

const url = config.get<string>("dbURI")
export default async function connect() {
    try {
        await mongoose.connect(url || "")
        console.log("Connected to mongoDB")
    } catch (error) {
        console.log(`Could not connect to db ${error}`)
        process.exit(1)
    }
}