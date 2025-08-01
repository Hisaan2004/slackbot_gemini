/*import { connectToDB } from "@/services/mongoDB_Two";
export default async function checkavailability(name,email,time,date){
const db=await connectToDB(MONGODB_DB_TIME);
const collections=db.collection("meeting_DB").find().toArray();

}
export default aysnc function addToDB(){

}*/
/*
import { connectToDB } from "@/services/mongoDB_Two";
const MONGODB_DB_TIME = "yourDatabaseName"; // replace with your actual DB name

/**
 * Check if a meeting slot is available
 */
/*
export async function checkAvailability(time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const startTime = new Date(`${date}T${time}:00+05:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30-minute slot

  const conflict = await collection.findOne({
    $or: [
      {
        start: { $lt: endTime },
        end: { $gt: startTime },
      },
    ],
  });

  if (conflict) {
    return { available: false, message: "Slot already booked" };
  }

  return { available: true, message: "Slot is available" };
}

/**
 * Add a new meeting to the DB
 */
/*
export async function addToDB(name, email, time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const startTime = new Date(`${date}T${time}:00+05:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const insertResult = await collection.insertOne({
    name,
    email,
    start: startTime,
    end: endTime,
    createdAt: new Date(),
  });

  return insertResult;
}*/
import { connectToDB } from "@/services/mongoDB_Two";
const MONGODB_DB_TIME =process.env.MONGODB_DB_TIME; // Change to your actual DB name
/*
export async function checkAvailability(time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const startTime = new Date(`${date}T${time}:00+05:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const conflict = await collection.findOne({
    start: { $lt: endTime },
    end: { $gt: startTime },
  });

  return {
    available: !conflict,
    message: conflict ? "Slot already booked" : "Slot is available",
  };
}
*/export async function checkAvailability(time, date) {
  const db = await connectToDB(MONGODB_DB_TIME);
  const collection = db.collection("meeting_DB");

  const [day, month, year] = date.split("-");
  const [hour, minute] = time.split(":");
  const startTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins duration

  // This checks if any meeting overlaps with the requested time
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

  // Parse date & time like checkAvailability
  const [day, month, year] = date.split("-");
  const [hour, minute] = time.split(":");
  const startTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  // Clean email if it's Slack formatted
  const cleanedEmail = email.includes('|') ? email.split('|')[1].replace('>', '') : email;

  return await collection.insertOne({
    name,
    email: cleanedEmail,
    date, // for easier formatting later
    start: startTime,
    end: endTime,
    createdAt: new Date(),
  });
}


