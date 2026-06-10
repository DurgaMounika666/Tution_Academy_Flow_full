const { connectDB } = require("./config/database");
const { FeePayment } = require("./models/FeePayment");
const { Student } = require("./models/Student");
const { ParentRegistration } = require("./models/ParentRegistration");

async function checkData() {
  await connectDB();
  
  console.log("=== FEE PAYMENTS ===");
  const fees = await FeePayment.find({});
  console.log(JSON.stringify(fees.map(f => ({
    feeId: f.feeId,
    studentId: f.studentId,
    studentName: f.studentName,
    title: f.title,
    amount: f.amount,
    status: f.status,
    transactionId: f.transactionId
  })), null, 2));

  console.log("=== STUDENTS ===");
  const students = await Student.find({});
  console.log(JSON.stringify(students.map(s => ({
    studentId: s.studentId,
    name: s.name,
    parentEmail: s.parentEmail
  })), null, 2));

  console.log("=== REGISTRATIONS ===");
  const regs = await ParentRegistration.find({});
  console.log(JSON.stringify(regs.map(r => ({
    id: r._id,
    name: r.parentName,
    email: r.email,
    childName: r.childName,
    registrationStatus: r.registrationStatus
  })), null, 2));

  process.exit(0);
}

checkData().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
