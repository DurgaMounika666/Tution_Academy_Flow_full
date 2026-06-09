const { connectDB } = require("./config/database");
const { User } = require("./models/User");
const { Tutor } = require("./models/Tutor");

async function checkUsers() {
  await connectDB();
  const users = await User.find({}).select("+password");
  console.log("=== USERS ===");
  console.log(users.map(u => ({ email: u.email, role: u.role, isActive: u.isActive })));
  
  const tutors = await Tutor.find({});
  console.log("=== TUTORS ===");
  console.log(tutors.map(t => ({ email: t.email, tutorId: t.tutorId, name: t.name })));
  
  process.exit(0);
}

checkUsers().catch(err => {
  console.error("Error checking users:", err);
  process.exit(1);
});
