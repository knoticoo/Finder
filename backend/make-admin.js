const { PrismaClient } = require('@prisma/client');

async function makeUserAdmin() {
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
        isVerified: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found with email: emalinovskis@me.com');
      console.log('📝 Let me show you all users to help identify the correct one:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.table(allUsers);
      console.log('\n💡 If your email is different, please update the script with the correct email.');
      return;
    }
    
    console.log('✅ User found:');
    console.table([user]);
    
    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN - no changes needed');
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
      
      console.log('✅ User updated successfully to ADMIN:');
      console.table([updatedUser]);
      console.log('\n🎉 You now have admin privileges!');
    }
    
    // Also check for any potential authentication issues
    console.log('\n🔍 Checking for potential auth issues...');
    
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    console.log(`📊 Database stats:`);
    console.log(`   Total users: ${userCount}`);
    console.log(`   Admin users: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🛠️  Troubleshooting tips:');
    console.log('1. Make sure the backend server is not running when you run this script');
    console.log('2. Check that your DATABASE_URL in .env is correct');
    console.log('3. Ensure PostgreSQL is running on your VPS');
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🚀 VisiPakalpojumi - Make User Admin Script');
console.log('==========================================\n');

makeUserAdmin();