/**
 * Migration script to update all API routes to use Supabase auth pattern
 *
 * This script:
 * 1. Finds all route.ts files in src/app/api
 * 2. Updates the auth pattern from userId-only to userId + organizationId
 * 3. Removes redundant user lookups
 * 4. Updates audit log references
 */

import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(__dirname, '../src/app/api');

// Files to skip (already migrated or special cases)
const SKIP_FILES = [
  'properties/route.ts',
  'properties/[id]/route.ts',
  'properties/[id]/units/route.ts',
  'tenants/route.ts',
  'tenants/[id]/route.ts',
  'leases/route.ts',
  'leases/[id]/route.ts',
  'onboarding/route.ts',
  'webhooks/stripe/route.ts', // Stripe webhooks don't use auth
  'applications/public/[token]/route.ts', // Public routes
  'applications/public/submit/route.ts', // Public routes
  'applications/public/[token]/create-payment-intent/route.ts', // Public routes
];

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

function shouldSkip(filePath: string): boolean {
  const relativePath = path.relative(API_DIR, filePath);
  return SKIP_FILES.some(skip => relativePath.includes(skip));
}

function migrateFile(filePath: string): { modified: boolean; changes: string[] } {
  let content = fs.readFileSync(filePath, 'utf-8');
  const changes: string[] = [];
  const originalContent = content;

  // Pattern 1: Update auth destructuring
  // From: const { userId } = await auth()
  // To: const { userId, organizationId } = await auth()
  const authPattern1 = /const\s*\{\s*userId\s*\}\s*=\s*await\s+auth\(\)/g;
  if (authPattern1.test(content)) {
    content = content.replace(authPattern1, 'const { userId, organizationId } = await auth()');
    changes.push('Updated auth destructuring to include organizationId');
  }

  // Pattern 2: Update auth check
  // From: if (!userId) {
  // To: if (!userId || !organizationId) {
  const authCheckPattern = /if\s*\(\s*!userId\s*\)\s*\{/g;
  if (authCheckPattern.test(content)) {
    content = content.replace(authCheckPattern, 'if (!userId || !organizationId) {');
    changes.push('Updated auth check to include organizationId');
  }

  // Pattern 3: Remove user lookup blocks
  // This removes the entire block:
  // // Get user with organization
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   include?: { organization: true },
  // })
  //
  // if (!user) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 })
  // }
  const userLookupPattern = /\s*\/\/\s*Get user with organization\s*\n\s*const user = await prisma\.user\.findUnique\(\{\s*\n\s*where:\s*\{\s*id:\s*userId\s*\},?\s*\n(?:\s*include:\s*\{[^}]*\},?\s*\n)?\s*\}\)\s*\n\s*\n\s*if\s*\(\s*!user\s*\)\s*\{\s*\n\s*return NextResponse\.json\(\s*\{\s*error:\s*['"]User not found['"]\s*\},\s*\{\s*status:\s*404\s*\}\s*\)\s*\n\s*\}/g;
  if (userLookupPattern.test(content)) {
    content = content.replace(userLookupPattern, '');
    changes.push('Removed redundant user lookup block');
  }

  // Pattern 4: Replace user.organizationId with organizationId
  content = content.replace(/user\.organizationId/g, (match) => {
    changes.push('Replaced user.organizationId with organizationId');
    return 'organizationId';
  });

  // Pattern 5: Replace user.id with userId in audit logs
  content = content.replace(/userId:\s*user\.id/g, (match) => {
    changes.push('Replaced user.id with userId in audit logs');
    return 'userId';
  });

  // Deduplicate changes
  const uniqueChanges = [...new Set(changes)];

  const modified = content !== originalContent;

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return { modified, changes: uniqueChanges };
}

// Main execution
function main() {
  console.log('🔍 Finding API route files...\n');

  const files = findRouteFiles(API_DIR);
  console.log(`Found ${files.length} route files\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let unchangedCount = 0;

  for (const file of files) {
    const relativePath = path.relative(API_DIR, file);

    if (shouldSkip(file)) {
      console.log(`⏭️  Skipped: ${relativePath}`);
      skippedCount++;
      continue;
    }

    const result = migrateFile(file);

    if (result.modified) {
      console.log(`✅ Migrated: ${relativePath}`);
      result.changes.forEach(change => console.log(`   - ${change}`));
      migratedCount++;
    } else {
      console.log(`➖ Unchanged: ${relativePath}`);
      unchangedCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Migrated: ${migratedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Unchanged: ${unchangedCount}`);
  console.log(`   Total: ${files.length}`);
}

main();
