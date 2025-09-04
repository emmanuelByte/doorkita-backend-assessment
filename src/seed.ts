import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './database/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting database seeding...');
    const seederService = app.get(SeederService);
    await seederService.seed();
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log('   • 12 users (3 doctors, 3 labs, 6 patients)');
    console.log('   • 8 lab orders with various statuses');
    console.log('   • 4 completed lab results');
    console.log('   • 5 audit log entries');
    console.log('\n🔑 Default password for all users: StrongPass123!');
    console.log('\n👥 Sample users:');
    console.log(
      '   Doctors: dr.smith@doorkita.com, dr.johnson@doorkita.com, dr.williams@doorkita.com',
    );
    console.log(
      '   Labs: lab.central@doorkita.com, lab.specialized@doorkita.com, lab.urgent@doorkita.com',
    );
    console.log(
      '   Patients: john.doe@email.com, jane.smith@email.com, robert.wilson@email.com, etc.',
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
