import HelpRequest from '../models/HelpRequest.js';

// @desc    Create a new help request
// @route   POST /api/help-requests
// @access  Private (Elder)
export const createHelpRequest = async (req, res, next) => {
  try {
    const { type, description, lat, lng } = req.body;

    if (!lat || !lng) {
      res.status(400);
      throw new Error('Location is required to create a help request');
    }

    const helpRequest = await HelpRequest.create({
      elder: req.user._id,
      elderName: req.user.name,
      type,
      description,
      elderLocation: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    });

    res.status(201).json({
      id: helpRequest._id,
      elderId: helpRequest.elder,
      elderName: helpRequest.elderName,
      type: helpRequest.type,
      description: helpRequest.description,
      status: helpRequest.status,
      createdAt: helpRequest.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby pending help requests
// @route   GET /api/help-requests/nearby
// @access  Private (Helper)
export const getNearbyHelpRequests = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.query;

    if (!lat || !lng) {
      res.status(400);
      throw new Error('Helper location (lat, lng) is required');
    }

    // Geospatial query to find nearby elders
    const radiusInMeters = radiusKm * 1000;

    const requests = await HelpRequest.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: { status: 'pending' },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Format distance for the frontend
    const formattedRequests = requests.map(req => {
      let distanceFormatted = `${Math.round(req.distance)}m`;
      if (req.distance >= 1000) {
        distanceFormatted = `${(req.distance / 1000).toFixed(1)}km`;
      }
      return {
        id: req._id,
        elderId: req.elder,
        elderName: req.elderName,
        type: req.type,
        description: req.description,
        distance: distanceFormatted,
        status: req.status,
        createdAt: req.createdAt,
      };
    });

    res.json(formattedRequests);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a help request
// @route   POST /api/help-requests/:id/accept
// @access  Private (Helper)
export const acceptHelpRequest = async (req, res, next) => {
  try {
    const request = await HelpRequest.findById(req.params.id).populate('helper', 'name phone');

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      res.status(400);
      throw new Error('Request is no longer pending');
    }

    request.status = 'accepted';
    request.helper = req.user._id;

    await request.save();

    res.json({
      id: request._id,
      elderId: request.elder,
      elderName: request.elderName,
      type: request.type,
      description: request.description,
      status: request.status,
      helper: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone
      },
      createdAt: request.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a help request as completed
// @route   POST /api/help-requests/:id/complete
// @access  Private (Elder or Helper)
export const completeHelpRequest = async (req, res, next) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    // Verify ownership (only the requesting elder or the assigned helper can complete it)
    const isOwner = req.user._id.toString() === request.elder.toString();
    const isAssignedHelper = request.helper && req.user._id.toString() === request.helper.toString();

    if (!isOwner && !isAssignedHelper) {
      res.status(403);
      throw new Error('Not authorized to complete this request');
    }

    request.status = 'completed';
    await request.save();

    res.json({
      id: request._id,
      status: request.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my help requests
// @route   GET /api/help-requests/mine
// @access  Private
export const getMyHelpRequests = async (req, res, next) => {
  try {
    let requests;
    
    if (req.user.role === 'elder') {
      requests = await HelpRequest.find({ elder: req.user._id }).populate('helper', 'name phone').sort({ createdAt: -1 });
    } else {
      // helper
      requests = await HelpRequest.find({ helper: req.user._id }).populate('elder', 'name').sort({ createdAt: -1 });
    }

    const formattedRequests = requests.map(req => ({
      id: req._id,
      elderId: req.elder?._id || req.elder,
      elderName: req.elderName || (req.elder ? req.elder.name : 'Unknown'),
      type: req.type,
      description: req.description,
      status: req.status,
      helper: req.helper ? {
        id: req.helper._id,
        name: req.helper.name,
        phone: req.helper.phone
      } : null,
      createdAt: req.createdAt
    }));

    res.json(formattedRequests);
  } catch (error) {
    next(error);
  }
};
