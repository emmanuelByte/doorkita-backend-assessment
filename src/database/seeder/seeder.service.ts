import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  AuditAction,
  AuditLog,
  ResourceType,
} from '../../audit-logs/entities/audit-log.entity';
import {
  LabOrder,
  LabOrderStatus,
  TestType,
} from '../../lab-orders/entities/lab-order.entity';
import { Result, ResultStatus } from '../../results/entities/result.entity';
import { User, UserRole } from '../../users/entities/user.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LabOrder)
    private readonly labOrderRepository: Repository<LabOrder>,
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      // Clear existing data
      await this.clearData();

      // Seed users
      const users = await this.seedUsers();

      // Seed lab orders
      const labOrders = await this.seedLabOrders(users);

      // Seed results
      await this.seedResults(labOrders, users);

      // Seed audit logs
      await this.seedAuditLogs(users);

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }

  private async clearData(): Promise<void> {
    this.logger.log('Clearing existing data...');
    // Use query runner to handle foreign key constraints properly
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');

      // Clear all tables
      await queryRunner.query(
        'TRUNCATE TABLE audit_logs, results, lab_orders, users RESTART IDENTITY CASCADE;',
      );

      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = DEFAULT;');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.log('Seeding users...');

    const hashedPassword = await bcrypt.hash('StrongPass123!', 12);

    const users = [
      // Doctors
      {
        email: 'dr.smith@doorkita.com',
        password: hashedPassword,
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        role: UserRole.DOCTOR,
        isActive: true,
      },
      {
        email: 'dr.johnson@doorkita.com',
        password: hashedPassword,
        firstName: 'Dr. Michael',
        lastName: 'Johnson',
        role: UserRole.DOCTOR,
        isActive: true,
      },
      {
        email: 'dr.williams@doorkita.com',
        password: hashedPassword,
        firstName: 'Dr. Emily',
        lastName: 'Williams',
        role: UserRole.DOCTOR,
        isActive: true,
      },

      // Labs
      {
        email: 'lab.central@doorkita.com',
        password: hashedPassword,
        firstName: 'Central',
        lastName: 'Laboratory',
        role: UserRole.LAB,
        isActive: true,
      },
      {
        email: 'lab.specialized@doorkita.com',
        password: hashedPassword,
        firstName: 'Specialized',
        lastName: 'Testing Lab',
        role: UserRole.LAB,
        isActive: true,
      },
      {
        email: 'lab.urgent@doorkita.com',
        password: hashedPassword,
        firstName: 'Urgent',
        lastName: 'Care Lab',
        role: UserRole.LAB,
        isActive: true,
      },

      // Patients
      {
        email: 'john.doe@email.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PATIENT,
        isActive: true,
      },
      {
        email: 'jane.smith@email.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.PATIENT,
        isActive: true,
      },
      {
        email: 'robert.wilson@email.com',
        password: hashedPassword,
        firstName: 'Robert',
        lastName: 'Wilson',
        role: UserRole.PATIENT,
        isActive: true,
      },
      {
        email: 'maria.garcia@email.com',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Garcia',
        role: UserRole.PATIENT,
        isActive: true,
      },
      {
        email: 'david.brown@email.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Brown',
        role: UserRole.PATIENT,
        isActive: true,
      },
      {
        email: 'lisa.davis@email.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Davis',
        role: UserRole.PATIENT,
        isActive: true,
      },
    ];

    const savedUsers = await this.userRepository.save(users);
    this.logger.log(`Created ${savedUsers.length} users`);
    return savedUsers;
  }

  private async seedLabOrders(users: User[]): Promise<LabOrder[]> {
    this.logger.log('Seeding lab orders...');

    const doctors = users.filter((user) => user.role === UserRole.DOCTOR);
    const patients = users.filter((user) => user.role === UserRole.PATIENT);
    const labs = users.filter((user) => user.role === UserRole.LAB);

    const labOrders = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        labId: labs[0].id,
        testType: TestType.BLOOD_TEST,
        notes: 'Routine blood work including CBC, CMP, and lipid panel',
        status: LabOrderStatus.COMPLETED,
        scheduledDate: new Date('2024-09-01T10:00:00Z'),
        completedDate: new Date('2024-09-01T14:30:00Z'),
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[0].id,
        labId: labs[1].id,
        testType: TestType.URINE_TEST,
        notes: 'Urinalysis for diabetes screening',
        status: LabOrderStatus.IN_PROGRESS,
        scheduledDate: new Date('2024-09-02T09:00:00Z'),
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[1].id,
        labId: labs[2].id,
        testType: TestType.X_RAY,
        notes: 'Chest X-ray for respiratory assessment',
        status: LabOrderStatus.COMPLETED,
        scheduledDate: new Date('2024-09-03T11:00:00Z'),
        completedDate: new Date('2024-09-03T11:45:00Z'),
      },
      {
        patientId: patients[3].id,
        doctorId: doctors[1].id,
        labId: labs[0].id,
        testType: TestType.BLOOD_TEST,
        notes: 'Thyroid function tests (TSH, T3, T4)',
        status: LabOrderStatus.PENDING,
        scheduledDate: new Date('2024-09-04T08:00:00Z'),
      },
      {
        patientId: patients[4].id,
        doctorId: doctors[2].id,
        labId: labs[1].id,
        testType: TestType.MRI,
        notes: 'Brain MRI for neurological evaluation',
        status: LabOrderStatus.COMPLETED,
        scheduledDate: new Date('2024-09-05T13:00:00Z'),
        completedDate: new Date('2024-09-05T14:15:00Z'),
      },
      {
        patientId: patients[5].id,
        doctorId: doctors[2].id,
        labId: labs[2].id,
        testType: TestType.CT_SCAN,
        notes: 'Abdominal CT scan for pain evaluation',
        status: LabOrderStatus.IN_PROGRESS,
        scheduledDate: new Date('2024-09-06T10:30:00Z'),
      },
      {
        patientId: patients[0].id,
        doctorId: doctors[1].id,
        labId: labs[1].id,
        testType: TestType.URINE_TEST,
        notes: 'Follow-up urinalysis for UTI treatment',
        status: LabOrderStatus.PENDING,
        scheduledDate: new Date('2024-09-07T15:00:00Z'),
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[2].id,
        labId: labs[0].id,
        testType: TestType.BLOOD_TEST,
        notes: 'Complete metabolic panel and electrolytes',
        status: LabOrderStatus.COMPLETED,
        scheduledDate: new Date('2024-09-08T09:30:00Z'),
        completedDate: new Date('2024-09-08T12:00:00Z'),
      },
    ];

    const savedLabOrders = await this.labOrderRepository.save(labOrders);
    this.logger.log(`Created ${savedLabOrders.length} lab orders`);
    return savedLabOrders;
  }

  private async seedResults(
    labOrders: LabOrder[],
    users: User[],
  ): Promise<void> {
    this.logger.log('Seeding lab results...');

    const labs = users.filter((user) => user.role === UserRole.LAB);
    const completedOrders = labOrders.filter(
      (order) => order.status === LabOrderStatus.COMPLETED,
    );

    // Only create results if we have completed orders
    if (completedOrders.length === 0) {
      this.logger.log('No completed orders found, skipping results seeding');
      return;
    }

    const results = [
      {
        labOrderId: completedOrders[0].id,
        labId: labs[0].id,
        resultText: 'Normal blood work results',
        comments: 'All values within normal range',
        status: ResultStatus.COMPLETED,
        completedAt: new Date('2024-09-01T14:30:00Z'),
        findings:
          'CBC: WBC 7.2 K/uL, RBC 4.8 M/uL, HGB 14.2 g/dL, PLT 250 K/uL. CMP: Glucose 95 mg/dL, BUN 15 mg/dL, Creatinine 0.9 mg/dL.',
        recommendations:
          'Continue current medications. Follow up in 6 months for routine screening.',
      },
    ];

    // Add more results if we have more completed orders
    if (completedOrders.length > 1) {
      results.push({
        labOrderId: completedOrders[1].id,
        labId: labs[1]?.id || labs[0].id,
        resultText: 'Normal chest X-ray',
        comments: 'No acute cardiopulmonary findings',
        status: ResultStatus.COMPLETED,
        completedAt: new Date('2024-09-03T11:45:00Z'),
        findings:
          'Heart size normal. Clear lung fields. No evidence of pneumonia, pleural effusion, or pneumothorax.',
        recommendations:
          'No immediate intervention required. Follow up as clinically indicated.',
      });
    }

    if (completedOrders.length > 2) {
      results.push({
        labOrderId: completedOrders[2].id,
        labId: labs[2]?.id || labs[0].id,
        resultText: 'Normal brain MRI',
        comments: 'No significant abnormalities detected',
        status: ResultStatus.COMPLETED,
        completedAt: new Date('2024-09-05T14:15:00Z'),
        findings:
          'Normal brain parenchyma. No mass lesions, hemorrhage, or acute infarcts. Ventricles and sulci normal in size.',
        recommendations:
          'Continue current treatment plan. No neurological intervention required.',
      });
    }

    if (completedOrders.length > 3) {
      results.push({
        labOrderId: completedOrders[3].id,
        labId: labs[0].id,
        resultText: 'Normal metabolic panel',
        comments: 'All electrolytes within normal limits',
        status: ResultStatus.COMPLETED,
        completedAt: new Date('2024-09-08T12:00:00Z'),
        findings:
          'Sodium 140 mEq/L, Potassium 4.0 mEq/L, Chloride 102 mEq/L, CO2 24 mEq/L. Glucose 92 mg/dL, BUN 12 mg/dL, Creatinine 0.8 mg/dL.',
        recommendations:
          'Maintain current diet and hydration. No medication adjustments needed.',
      });
    }

    const savedResults = await this.resultRepository.save(results);
    this.logger.log(`Created ${savedResults.length} lab results`);
  }

  private async seedAuditLogs(users: User[]): Promise<void> {
    this.logger.log('Seeding audit logs...');

    const auditLogs = [
      {
        userId: users[0].id,
        userRole: users[0].role,
        action: AuditAction.CREATE,
        resourceType: ResourceType.USER,
        resourceId: users[1].id,
        description: 'Created new doctor account',
        metadata: { email: users[1].email, role: users[1].role },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/users',
        method: 'POST',
        statusCode: 201,
        responseTime: 150,
      },
      {
        userId: users[0].id,
        userRole: users[0].role,
        action: AuditAction.CREATE,
        resourceType: ResourceType.LAB_ORDER,
        resourceId: 'sample-order-id',
        description: 'Created lab order for patient',
        metadata: { testType: TestType.BLOOD_TEST, patientId: users[6].id },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/lab-orders',
        method: 'POST',
        statusCode: 201,
        responseTime: 200,
      },
      {
        userId: users[3].id,
        userRole: users[3].role,
        action: AuditAction.UPDATE,
        resourceType: ResourceType.LAB_ORDER,
        resourceId: 'sample-order-id',
        description: 'Updated lab order status to IN_PROGRESS',
        metadata: { status: LabOrderStatus.IN_PROGRESS },
        ipAddress: '192.168.1.101',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        endpoint: '/lab-orders/sample-order-id',
        method: 'PATCH',
        statusCode: 200,
        responseTime: 180,
      },
      {
        userId: users[3].id,
        userRole: users[3].role,
        action: AuditAction.CREATE,
        resourceType: ResourceType.RESULT,
        resourceId: 'sample-result-id',
        description: 'Created lab result',
        metadata: {
          labOrderId: 'sample-order-id',
          status: ResultStatus.COMPLETED,
        },
        ipAddress: '192.168.1.101',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        endpoint: '/results',
        method: 'POST',
        statusCode: 201,
        responseTime: 220,
      },
      {
        userId: users[6].id,
        userRole: users[6].role,
        action: AuditAction.READ,
        resourceType: ResourceType.RESULT,
        resourceId: 'sample-result-id',
        description: 'Viewed lab result',
        metadata: { labOrderId: 'sample-order-id' },
        ipAddress: '192.168.1.102',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        endpoint: '/results/sample-result-id',
        method: 'GET',
        statusCode: 200,
        responseTime: 120,
      },
    ];

    const savedAuditLogs = await this.auditLogRepository.save(auditLogs);
    this.logger.log(`Created ${savedAuditLogs.length} audit logs`);
  }
}
