"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCategories = exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getAllServices = void 0;
const database_1 = require("@/config/database");
const getAllServices = async (req, res) => {
    try {
        console.log('getAllServices called - returning mock data');
        const mockServices = [
            {
                id: '1',
                title: 'Mājas tīrīšana',
                description: 'Profesionāla mājas tīrīšana ar ekoloģiskiem līdzekļiem',
                price: 25.00,
                category: 'Tīrīšana',
                location: 'Rīga',
                averageRating: 4.8,
                totalReviews: 12,
                provider: {
                    firstName: 'Anna',
                    lastName: 'Bērziņa'
                }
            },
            {
                id: '2',
                title: 'Santehnikas remonts',
                description: 'Ātrs un kvalitatīvs santehnikas remonts',
                price: 40.00,
                category: 'Remonts',
                location: 'Rīga',
                averageRating: 4.5,
                totalReviews: 8,
                provider: {
                    firstName: 'Jānis',
                    lastName: 'Kalniņš'
                }
            },
            {
                id: '3',
                title: 'Matemātikas mācības',
                description: 'Individuālās matemātikas stundas skolēniem',
                price: 15.00,
                category: 'Izglītība',
                location: 'Rīga',
                averageRating: 4.9,
                totalReviews: 25,
                provider: {
                    firstName: 'Līga',
                    lastName: 'Ozoliņa'
                }
            },
            {
                id: '4',
                title: 'Dārza kopt šana',
                description: 'Profesionāla dārza aprūpe un labiekārtošana',
                price: 35.00,
                category: 'Dārzs',
                location: 'Jūrmala',
                averageRating: 4.6,
                totalReviews: 15,
                provider: {
                    firstName: 'Andris',
                    lastName: 'Liepa'
                }
            },
            {
                id: '5',
                title: 'Auto remonts',
                description: 'Ātra un kvalitatīva automašīnu diagnostika un remonts',
                price: 50.00,
                category: 'Auto',
                location: 'Rīga',
                averageRating: 4.7,
                totalReviews: 22,
                provider: {
                    firstName: 'Māris',
                    lastName: 'Krūmiņš'
                }
            }
        ];
        res.status(200).json({
            success: true,
            data: mockServices,
            pagination: {
                page: 1,
                limit: 10,
                total: mockServices.length,
                pages: 1
            }
        });
    }
    catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getAllServices = getAllServices;
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await database_1.prisma.service.findUnique({
            where: { id },
            include: {
                provider: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                        providerProfile: {
                            select: {
                                businessName: true,
                                description: true,
                                isVerified: true,
                                city: true,
                                hasInsurance: true,
                                certifications: true
                            }
                        }
                    }
                },
                category: true,
                subcategory: true,
                reviews: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        reviews: true,
                        bookings: true
                    }
                }
            }
        });
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: service
        });
    }
    catch (error) {
        console.error('Get service by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getServiceById = getServiceById;
const createService = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'PROVIDER') {
            res.status(403).json({
                success: false,
                message: 'Only providers can create services'
            });
            return;
        }
        const { title, titleLv, titleRu, titleEn, description, descriptionLv, descriptionRu, descriptionEn, price, priceType, currency, categoryId, subcategoryId, serviceArea, travelFee, images, videos } = req.body;
        const service = await database_1.prisma.service.create({
            data: {
                providerId: req.user.id,
                title,
                titleLv,
                titleRu,
                titleEn,
                description,
                descriptionLv,
                descriptionRu,
                descriptionEn,
                price,
                priceType,
                currency,
                categoryId,
                subcategoryId,
                serviceArea,
                travelFee,
                images: images || [],
                videos: videos || []
            },
            include: {
                category: true,
                subcategory: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    }
    catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const service = await database_1.prisma.service.findUnique({
            where: { id },
            select: { providerId: true }
        });
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }
        if (service.providerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only update your own services'
            });
            return;
        }
        const updatedService = await database_1.prisma.service.update({
            where: { id },
            data: req.body,
            include: {
                category: true,
                subcategory: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
        });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const service = await database_1.prisma.service.findUnique({
            where: { id },
            select: { providerId: true }
        });
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }
        if (service.providerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own services'
            });
            return;
        }
        await database_1.prisma.service.delete({
            where: { id }
        });
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteService = deleteService;
const getServiceCategories = async (_req, res) => {
    try {
        const categories = await database_1.prisma.serviceCategory.findMany({
            where: { isActive: true },
            include: {
                subcategories: {
                    where: { isActive: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        console.error('Get service categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getServiceCategories = getServiceCategories;
//# sourceMappingURL=serviceController.js.map