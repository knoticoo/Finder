#!/usr/bin/env node

// Simple script to make a user admin
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeUserAdmin(email) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      return
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { 
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    })

    console.log(`✅ User ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}) is now an ADMIN`)
    console.log(`   User ID: ${updatedUser.id}`)
    console.log(`   Role: ${updatedUser.role}`)
    console.log(`   Verified: ${updatedUser.isVerified}`)
    console.log(`   Active: ${updatedUser.isActive}`)

  } catch (error) {
    console.error('❌ Error making user admin:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('Usage: node make-admin-simple.js <email>')
  console.log('Example: node make-admin-simple.js admin@example.com')
  process.exit(1)
}

makeUserAdmin(email)