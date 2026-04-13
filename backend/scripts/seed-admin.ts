import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { Prompt } from '../src/modules/prompts/entities/prompt.entity';
import { Category } from '../src/modules/categories/entities/category.entity';
import { Topic } from '../src/modules/topics/entities/topic.entity';
import { ExamAttempt } from '../src/modules/scoring/entities/exam-attempt.entity';
import { ScoringCriteria } from '../src/modules/scoring/entities/scoring-criteria.entity';


// Load environment variables from .env file
dotenv.config();

async function seed() {
  const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'test',
    entities: [User, Prompt, Category, Topic, ExamAttempt, ScoringCriteria],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully.');

    const userRepository = AppDataSource.getRepository(User);

    // THÔNG TIN ADMIN MẶC ĐỊNH 
    const adminEmail = 'admin@gmail.com';
    const adminPass = 'Admin123456';
    const adminName = 'System Admin';

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists. Skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      
      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: UserRole.ADMIN,
      });

      await userRepository.save(admin);
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPass}`);

    }

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

seed();
