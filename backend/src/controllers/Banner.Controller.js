const Banner = require('../models/Banner');

// Map banner data for response
const mapBanner = (banner) => ({
    id: banner._id,
    title: banner.title,
    image_url: banner.image_url,
    order: banner.order,
    is_active: banner.is_active,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt
});

exports.list = async (req, res) => {
    try {
        const banners = await Banner.find()
            .sort({ order: 1, createdAt: -1 });
        res.json(banners.map(mapBanner));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banners',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { title, image_url, order, is_active } = req.body;
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { title, image_url, order, is_active },
            { new: true }
        );
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }
        res.json({
            success: true,
            data: mapBanner(banner)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating banner',
            error: error.message
        });
    }
};

exports.remove = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }
        res.json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting banner',
            error: error.message
        });
    }
};

// ...existing code...

exports.swapOrder = async (req, res) => {
    try {
        const { firstId, secondId } = req.body;

        // Find both banners
        const firstBanner = await Banner.findById(firstId);
        const secondBanner = await Banner.findById(secondId);

        if (!firstBanner || !secondBanner) {
            return res.status(404).json({
                success: false,
                message: 'One or both banners not found'
            });
        }

        // Swap their orders
        const tempOrder = firstBanner.order;
        firstBanner.order = secondBanner.order;
        secondBanner.order = tempOrder;

        // Save both banners
        await Promise.all([
            firstBanner.save(),
            secondBanner.save()
        ]);

        res.json({
            success: true,
            message: 'Banner orders swapped successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error swapping banner orders',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, image_url, is_active } = req.body;

        // Get all current orders sorted
        const banners = await Banner.find().select('order').sort({ order: 1 });
        
        // Find first missing order number
        let nextOrder = 1;
        for (const banner of banners) {
            if (banner.order !== nextOrder) {
                break;
            }
            nextOrder++;
        }

        const banner = new Banner({
            title,
            image_url,
            is_active,
            order: nextOrder // Use the found order number
        });

        await banner.save();
        
        res.status(201).json({
            success: true,
            data: mapBanner(banner)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating banner',
            error: error.message
        });
    }
};
