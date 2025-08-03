
import { connectToDB } from "@/services/mongoDB_Two";
const MONGODB_DB_TIME =process.env.MONGODB_DB_TIME; 

export async function checkAvailability(time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const [day, month, year] = date.split("-");
  const [hour, minute] = time.split(":");
  const startTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins duration

  const conflict = await collection.findOne({
    start: { $lt: endTime },
    end: { $gt: startTime }
  });

  return {
    available: !conflict,
    message: conflict ? "Slot already booked" : "Slot is available",
  };
}
export async function addToDB(name, email, time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const [day, month, year] = date.split("-");
  const [hour, minute] = time.split(":");
  const startTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const cleanedEmail = email.includes('|') ? email.split('|')[1].replace('>', '') : email;

  return await collection.insertOne({
    name,
    email: cleanedEmail,
    date, 
    start: startTime,
    end: endTime,
    createdAt: new Date(),
  });
}


