import Medicine from '../models/Medicine.js';

// @desc    Get medicines for logged in user
// @route   GET /api/medicines
// @access  Private (Elder)
export const getMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id });
    
    const formattedMedicines = medicines.map(med => ({
      id: med._id,
      name: med.name,
      purpose: med.purpose,
      dosage: med.dosage,
      times: med.times,
      notes: med.notes,
      warnings: med.warnings,
      reminderTime: med.reminderTime,
      endDate: med.endDate,
      takenDates: med.takenDates,
      currentQuantity: med.currentQuantity,
      totalQuantity: med.totalQuantity,
      refillThreshold: med.refillThreshold,
      needsRefill: med.needsRefill,
    }));

    res.json(formattedMedicines);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new medicine
// @route   POST /api/medicines
// @access  Private (Elder)
export const createMedicine = async (req, res, next) => {
  try {
    const { name, purpose, dosage, times, notes, warnings, reminderTime, endDate, currentQuantity, totalQuantity, refillThreshold } = req.body;

    const medicine = await Medicine.create({
      user: req.user._id,
      name,
      purpose,
      dosage,
      times,
      notes,
      warnings,
      reminderTime,
      endDate: endDate ? new Date(endDate) : undefined,
      currentQuantity: currentQuantity || 0,
      totalQuantity: totalQuantity || 0,
      refillThreshold: refillThreshold || 7,
      needsRefill: (currentQuantity || 0) <= (refillThreshold || 7),
    });

    res.status(201).json({
      id: medicine._id,
      name: medicine.name,
      purpose: medicine.purpose,
      dosage: medicine.dosage,
      times: medicine.times,
      notes: medicine.notes,
      warnings: medicine.warnings,
      reminderTime: medicine.reminderTime,
      endDate: medicine.endDate,
      takenDates: medicine.takenDates,
      currentQuantity: medicine.currentQuantity,
      totalQuantity: medicine.totalQuantity,
      refillThreshold: medicine.refillThreshold,
      needsRefill: medicine.needsRefill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Elder)
export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    await medicine.deleteOne();
    res.json({ message: 'Medicine removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark medicine as taken
// @route   PUT /api/medicines/:id/taken
// @access  Private (Elder)
export const markMedicineTaken = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    const { date } = req.body;
    const takenDate = date ? new Date(date) : new Date();

    medicine.takenDates.push(takenDate);
    
    if (medicine.currentQuantity > 0) {
      medicine.currentQuantity -= 1;
    }

    medicine.needsRefill = medicine.currentQuantity <= medicine.refillThreshold;

    await medicine.save();

    res.json({
      id: medicine._id,
      name: medicine.name,
      purpose: medicine.purpose,
      dosage: medicine.dosage,
      times: medicine.times,
      notes: medicine.notes,
      warnings: medicine.warnings,
      reminderTime: medicine.reminderTime,
      endDate: medicine.endDate,
      takenDates: medicine.takenDates,
      currentQuantity: medicine.currentQuantity,
      totalQuantity: medicine.totalQuantity,
      refillThreshold: medicine.refillThreshold,
      needsRefill: medicine.currentQuantity <= medicine.refillThreshold
    });
  } catch (error) {
    next(error);
  }
};
