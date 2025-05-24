import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany();
  if (books.length === 0) {
    throw new Error('Nincsenek könyvek az adatbázisban!');
  }

  const rentals = Array.from({ length: 15 }).map(() => {
    const book = books[Math.floor(Math.random() * books.length)];
    const start = new Date();
    start.setDate(start.getDate() - Math.floor(Math.random() * 30));
    const end = new Date(start);
    end.setDate(start.getDate() + Math.floor(Math.random() * 30) + 1);
    return {
      book_id: book.id,
      start_date: start,
      end_date: end,
    };
  });

  await prisma.rental.createMany({ data: rentals });
  console.log('15 rental rekord beszúrva!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());