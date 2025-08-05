"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCategories = exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getAllServices = void 0;
const database_1 = require("../config/database");
const getAllServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, minPrice, maxPrice, rating } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            isAvailable: true,
            isActive: true
        };
        if (category) {
            where.categoryId = category;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        if (rating) {
            where.averageRating = { gte: Number(rating) };
        }
        const services = await database_1.prisma.service.findMany({
            where,
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
                                isVerified: true,
                                city: true
                            }
                        }
                    }
                },
                category: true,
                subcategory: true,
                _count: {
                    select: {
                        reviews: true,
                        bookings: true
                    }
                }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await database_1.prisma.service.count({ where });
        res.status(200).json({
            success: true,
            data: services,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
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