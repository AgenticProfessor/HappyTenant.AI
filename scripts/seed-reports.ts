
import { PrismaClient, PropertyType, LeaseType, RentFrequency, ChargeType, ChargeStatus, PaymentMethod, PaymentStatus, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding comprehensive report data...');

    // 1. Get or Create User and Organization
    let user = await prisma.user.findFirst({
        include: { Organization: true },
    });

    if (!user) {
        console.log('No user found. Creating default user and organization...');
        const org = await prisma.organization.create({
            data: {
                name: 'Default Organization',
                slug: 'default-org',
                type: 'INDIVIDUAL',
            },
        });

        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                organizationId: org.id,
                role: 'OWNER',
            },
            include: { organization: true },
        });
    }

    const organizationId = user.organizationId;
    console.log(`Using Organization: ${user.organization.name} (${organizationId})`);

    // 2. Create Properties
    // Property 1: Active with tenants
    const property1 = await prisma.property.create({
        data: {
            organizationId,
            name: 'Sunset Apartments',
            type: PropertyType.MULTI_FAMILY,
            addressLine1: '123 Sunset Blvd',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90028',
            status: 'ACTIVE',
            purchasePrice: 1500000,
            purchaseDate: new Date('2020-01-15'),
        },
    });

    // Property 2: Single Family Home (Vacant)
    const property2 = await prisma.property.create({
        data: {
            organizationId,
            name: 'Maple House',
            type: PropertyType.SINGLE_FAMILY,
            addressLine1: '456 Maple Ave',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            status: 'ACTIVE',
            purchasePrice: 350000,
            purchaseDate: new Date('2018-06-01'),
        },
    });

    // 3. Create Units
    const unit1 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitNumber: '101',
            bedrooms: 2,
            bathrooms: 1,
            marketRent: 2000,
            depositAmount: 2000,
            status: 'OCCUPIED',
        },
    });

    const unit2 = await prisma.unit.create({
        data: {
            propertyId: property1.id,
            unitNumber: '102',
            bedrooms: 1,
            bathrooms: 1,
            marketRent: 1600,
            depositAmount: 1600,
            status: 'VACANT',
            availableDate: new Date('2024-01-01'), // Vacant for a while
        },
    });

    const unit3 = await prisma.unit.create({
        data: {
            propertyId: property2.id,
            unitNumber: 'Main',
            bedrooms: 3,
            bathrooms: 2,
            marketRent: 2500,
            depositAmount: 2500,
            status: 'VACANT',
            availableDate: new Date(), // Just became vacant
        },
    });

    // 4. Create Tenants
    const tenant1 = await prisma.tenant.create({
        data: {
            organizationId,
            firstName: 'Alice',
            lastName: 'Smith',
            email: `alice.${Date.now()}@example.com`,
            phone: '555-0101',
        },
    });

    const tenant2 = await prisma.tenant.create({
        data: {
            organizationId,
            firstName: 'Bob',
            lastName: 'Jones',
            email: `bob.${Date.now()}@example.com`,
            phone: '555-0102',
        },
    });

    // 5. Create Leases
    // Active lease for Unit 101
    const lease1 = await prisma.lease.create({
        data: {
            unitId: unit1.id,
            leaseType: LeaseType.FIXED,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            rentAmount: 2000,
            rentFrequency: RentFrequency.MONTHLY,
            securityDeposit: 2000,
            status: 'ACTIVE',
            leaseTenants: {
                create: { tenantId: tenant1.id, role: 'PRIMARY' },
            },
        },
    });

    // Expired lease for Unit 102 (Bob moved out)
    const lease2 = await prisma.lease.create({
        data: {
            unitId: unit2.id,
            leaseType: LeaseType.FIXED,
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            rentAmount: 1500,
            rentFrequency: RentFrequency.MONTHLY,
            securityDeposit: 1500,
            status: 'EXPIRED',
            leaseTenants: {
                create: { tenantId: tenant2.id, role: 'PRIMARY' },
            },
        },
    });

    // 6. Create Payments (Income)
    // Alice pays rent on time
    await prisma.payment.create({
        data: {
            leaseId: lease1.id,
            tenantId: tenant1.id,
            amount: 2000,
            method: PaymentMethod.ACH,
            status: PaymentStatus.COMPLETED,
            receivedAt: new Date(),
            notes: 'Rent Payment',
        },
    });

    // 7. Create Charges (Receivables/Aging)
    // Alice has a late fee due
    await prisma.charge.create({
        data: {
            leaseId: lease1.id,
            tenantId: tenant1.id,
            type: ChargeType.LATE_FEE,
            description: 'Late Fee - Nov',
            amount: 50,
            dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days overdue
            status: ChargeStatus.DUE,
        },
    });

    // Bob left with unpaid rent (Aging 90+)
    await prisma.charge.create({
        data: {
            leaseId: lease2.id,
            tenantId: tenant2.id,
            type: ChargeType.RENT,
            description: 'Unpaid Rent - Dec 2023',
            amount: 1500,
            dueDate: new Date('2023-12-01'), // Very overdue
            status: ChargeStatus.DUE,
        },
    });

    // 8. Create Vendors and Expenses (1099 & Profit/Loss)
    const vendor1 = await prisma.vendor.create({
        data: {
            organizationId,
            name: 'Joe Plumber',
            licenseNumber: '12-3456789', // EIN
            phone: '555-9999',
            categories: ['PLUMBING'],
        },
    });

    // Maintenance Request (Completed and Paid)
    const maintenance = await prisma.maintenanceRequest.create({
        data: {
            unitId: unit1.id,
            title: 'Leaky Faucet',
            description: 'Kitchen sink leaking',
            category: 'PLUMBING',
            status: 'COMPLETED',
            assignedToVendorId: vendor1.id,
            actualCost: 750, // Over $600 threshold for 1099
            resolvedAt: new Date(),
        },
    });

    // Expense record for the maintenance
    await prisma.expense.create({
        data: {
            organizationId,
            propertyId: property1.id,
            vendorId: vendor1.id,
            category: ExpenseCategory.REPAIRS_MAINTENANCE,
            description: 'Leaky Faucet Repair',
            amount: 750,
            expenseDate: new Date(),
            paymentMethod: PaymentMethod.CHECK,
        },
    });

    // General Expense (Insurance)
    await prisma.expense.create({
        data: {
            organizationId,
            propertyId: property1.id,
            category: ExpenseCategory.INSURANCE,
            description: 'Property Insurance',
            amount: 1200,
            expenseDate: new Date(),
            paymentMethod: PaymentMethod.ACH,
        },
    });

    console.log('Seeding complete! Data ready for all reports.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
