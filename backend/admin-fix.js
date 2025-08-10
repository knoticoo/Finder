const { PrismaClient } = require('@prisma/client');

async function fixUserAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Looking for user with email: emalinovskis@me.com');
    
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'emalinovskis@me.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found with email: emalinovskis@me.com');
      console.log('📝 Available users:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });
      console.table(allUsers);
      return;
    }
    
    console.log('✅ User found:');
    console.table([user]);
    
    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN');
    } else {
      console.log(`🔧 Updating user role from ${user.role} to ADMIN...`);
      
      const updatedUser = await prisma.user.update({
        where: { email: 'emalinovskis@me.com' },
        data: { 
          role: 'ADMIN',
          isVerified: true,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true
        }
      });
      
      console.log('✅ User updated successfully:');
      console.table([updatedUser]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserAdmin();