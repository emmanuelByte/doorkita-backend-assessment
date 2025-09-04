import { Command, CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';

@Command({
  name: 'seed',
  description: 'Seed the database with sample data',
})
export class SeedCommand extends CommandRunner {
  constructor(private readonly seederService: SeederService) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      await this.seederService.seed();
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
    }
  }
}
