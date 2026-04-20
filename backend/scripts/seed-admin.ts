import { createConnection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { UserProfile } from '../src/modules/user-profiles/entities/user-profile.entity';
import { Prompt } from '../src/modules/prompts/entities/prompt.entity';
import { Category } from '../src/modules/categories/entities/category.entity';
import { Topic } from '../src/modules/topics/entities/topic.entity';
import { PracticeAttempt } from '../src/modules/practice/entities/practice-attempt.entity';
import { ScoringCriteria } from '../src/modules/scoring-criteria/entities/scoring-criteria.entity';
dotenv.config();

async function seed() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'test',
    entities: [User, UserProfile, Prompt, Category, Topic, PracticeAttempt, ScoringCriteria],
    synchronize: false,
  });

  const userRepository = connection.getRepository(User);

  const adminEmail = 'admin@gmail.com';
  const adminPass = 'Admin123456';
  const adminName = 'System Admin';

  try {
    const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists. Skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      
      const admin = new User();
      admin.email = adminEmail;
      admin.password = hashedPassword;
      admin.role = UserRole.ADMIN;

      // Khởi tạo profile kèm theo chuẩn quan hệ 1-1
      const profile = new UserProfile();
      profile.displayName = adminName;
      profile.isOnboardingCompleted = true; // Admin mặc định xong onboarding
      admin.profile = profile;

      await userRepository.save(admin);
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPass}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await connection.close();
  }
}

seed();
