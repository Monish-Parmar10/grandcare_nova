import EmergencyContact from '../models/EmergencyContact.js';

// @desc    Get emergency contacts
// @route   GET /api/sos/contacts
// @access  Private (Elder)
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ elder: req.user._id });
    
    const formattedContacts = contacts.map(c => ({
      id: c._id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
    }));

    res.json(formattedContacts);
  } catch (error) {
    next(error);
  }
};

// @desc    Add emergency contact
// @route   POST /api/sos/contacts
// @access  Private (Elder)
export const addContact = async (req, res, next) => {
  try {
    const { name, relationship, phone } = req.body;

    const contact = await EmergencyContact.create({
      elder: req.user._id,
      name,
      relationship,
      phone,
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger SOS
// @route   POST /api/sos/trigger
// @access  Private (Elder)
export const triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    const contacts = await EmergencyContact.find({ elder: req.user._id });

    // In a real application, you would integrate an SMS gateway like Twilio here
    // to send an alert to all `contacts` with the `lat` and `lng`.
    
    res.json({
      message: 'SOS triggered successfully',
      alertedContacts: contacts.length,
      location: { lat, lng },
    });
  } catch (error) {
    next(error);
  }
};
