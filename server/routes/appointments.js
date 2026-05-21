router.post("/", verifyToken, async (req, res) => {
  const { doctor_id, appointment_date } = req.body;
  const patient_id = req.userId;

  // 1. Check if doctor is already booked at that time
  const [existing] = await db.execute(
    'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != "cancelled"',
    [doctor_id, appointment_date],
  );

  if (existing.length > 0) {
    return res
      .status(400)
      .json({ message: "Doctor is already booked for this time slot." });
  }

  // 2. Create booking
  await db.execute(
    "INSERT INTO appointments (patient_id, doctor_id, appointment_date) VALUES (?, ?, ?)",
    [patient_id, doctor_id, appointment_date],
  );

  res.status(201).json({ message: "Appointment booked successfully!" });
});
