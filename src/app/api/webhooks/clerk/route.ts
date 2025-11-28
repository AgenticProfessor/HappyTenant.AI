import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Get the Clerk webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Error occured -- missing webhook secret', {
      status: 500,
    })
  }

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook event
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    )

    if (!primaryEmail) {
      return new Response('No primary email found', { status: 400 })
    }

    try {
      // Create organization and user in a transaction
      await prisma.$transaction(async (tx) => {
        // Create the organization first (every user gets their own org initially)
        const organization = await tx.organization.create({
          data: {
            name: `${first_name || 'My'}'s Properties`,
            slug: `${id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            type: 'INDIVIDUAL',
            subscriptionTier: 'FREE',
            email: primaryEmail.email_address,
          },
        })

        // Create the user linked to the organization
        await tx.user.create({
          data: {
            id, // Use Clerk's user ID
            organizationId: organization.id,
            email: primaryEmail.email_address,
            firstName: first_name || 'User',
            lastName: last_name || '',
            avatarUrl: image_url,
            role: 'OWNER', // First user is always owner
          },
        })

        // Create audit log entry
        await tx.auditLog.create({
          data: {
            organizationId: organization.id,
            userId: id,
            action: 'CREATE',
            entityType: 'user',
            entityId: id,
            description: `User ${primaryEmail.email_address} signed up and created organization`,
          },
        })
      })

      return new Response('User created', { status: 200 })
    } catch (error) {
      console.error('Error creating user in database:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    )

    try {
      await prisma.user.update({
        where: { id },
        data: {
          email: primaryEmail?.email_address,
          firstName: first_name || 'User',
          lastName: last_name || '',
          avatarUrl: image_url,
        },
      })

      return new Response('User updated', { status: 200 })
    } catch (error) {
      console.error('Error updating user in database:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      return new Response('No user ID provided', { status: 400 })
    }

    try {
      // Soft delete - mark user as inactive
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
        },
      })

      return new Response('User deleted', { status: 200 })
    } catch (error) {
      console.error('Error deleting user from database:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  // Return a 200 response for unhandled events
  return new Response('Webhook received', { status: 200 })
}
