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

    res.status(201).json(helpRequest);
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
    const request = await HelpRequest.findById(req.params.id);

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

    // In a real app, emit Socket.io event here to notify elder
    // io.to(`user_${request.elder}`).emit('requestAccepted', request);

    res.json(request);
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

    res.json(request);
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
      requests = await HelpRequest.find({ elder: req.user._id }).sort({ createdAt: -1 });
    } else {
      // helper
      requests = await HelpRequest.find({ helper: req.user._id, status: 'accepted' }).sort({ createdAt: -1 });
    }

    res.json(requests);
  } catch (error) {
    next(error);
  }
};
