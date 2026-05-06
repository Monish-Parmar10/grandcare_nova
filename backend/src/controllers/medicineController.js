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
    const { name, purpose, dosage, times, notes } = req.body;

    const medicine = await Medicine.create({
      user: req.user._id,
      name,
      purpose,
      dosage,
      times,
      notes,
    });

    res.status(201).json(medicine);
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
