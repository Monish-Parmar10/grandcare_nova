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

// @desc    Delete emergency contact
// @route   DELETE /api/sos/contacts/:id
// @access  Private (Elder)
export const deleteContact = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error('Invalid contact ID format');
    }
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      elder: req.user._id
    });
    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }
    res.json({ message: 'Contact removed' });
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
    const apikey = process.env.TEXTMEBOT_APIKEY;

    if (!apikey) {
      console.warn('TEXTMEBOT_APIKEY is not set in environment variables');
    }

    const messageText = `${req.user.name} has triggered an SOS alert, with a Google Maps link: https://maps.google.com/?q=${lat},${lng}`;

    const sendPromises = contacts.map(async (contact) => {
      if (!contact.phone) return;
      try {
        const url = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(contact.phone)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(messageText)}`;
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to send SOS alert to ${contact.name} (${contact.phone}): Status ${response.status}`);
        }
      } catch (err) {
        console.error(`Error sending SOS alert to ${contact.name}:`, err);
      }
    });

    await Promise.all(sendPromises);

    res.json({
      message: 'SOS triggered successfully',
      alertedContacts: contacts.length,
      location: { lat, lng },
    });
  } catch (error) {
    next(error);
  }
};
