/*import {connectToDB} from "@/services/mongoDB_Two";
export async function meetingDeletion(){
const date=new Date();
const db = await connectToDB(MONGODB_DB_TIME);
const collections = db.collection("meeting_DB");
const result=db.collections.find()
}*/
import { connectToDB } from "@/services/mongoDB_Two";

const MONGODB_DB_TIME = process.env.MONGODB_DB_TIME; // Replace with your DB name

export async function meetingDeletion() {
  try {
    const currentDate = new Date();

    const db = await connectToDB(MONGODB_DB_TIME);
    const collection = db.collection("meeting_DB");

    // Delete all meetings where the date is less than now
    const result = await collection.deleteMany({
      meetingDate: { $lt: currentDate }
    });

    console.log(`${result.deletedCount} past meetings deleted.`);
    return result;
  } catch (error) {
    console.error("Error deleting past meetings:", error);
  }
}