import { prisma } from "../lib/prisma";

export async function getOrCreateContact(phone: string, name = "") {
  return prisma.contact.upsert({
    where: { phone },
    update: {
      name: name || undefined,
    },
    create: {
      phone,
      name: name || null,
    },
  });
}
