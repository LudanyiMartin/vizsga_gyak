import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BooksService {
  async getAllBooks() {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        publish_year: true,
        page_count: true,
      },
    });
    return books.map(book => ({
      ...book,
      id: book.id.toString(),
    }));
  }

  async createBook(body: any) {
    const { title, author, publish_year, page_count } = body;
    const errors = [];
    if (!title) errors.push('title is required');
    if (!author) errors.push('author is required');
    if (publish_year === undefined || !Number.isInteger(publish_year)) errors.push('publish_year must be an integer');
    if (page_count === undefined || !Number.isInteger(page_count) || page_count <= 0) errors.push('page_count must be a positive integer');
    if (errors.length > 0) {
      throw new HttpException({ message: errors.join(', ') }, HttpStatus.BAD_REQUEST);
    }
    const book = await prisma.book.create({
      data: {
        title,
        author,
        publish_year,
        page_count,
      },
      select: { id: true, title: true, author: true, publish_year: true, page_count: true },
    });
    return { ...book, id: book.id.toString() };
  }

  async rentBook(id: string) {
    const bookId = BigInt(id);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new HttpException({ message: 'Book not found' }, HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(now.getDate() + 7);
    const conflict = await prisma.rental.findFirst({
      where: {
        book_id: bookId,
        start_date: { lte: now },
        end_date: { gte: now },
      },
    });
    if (conflict) {
      throw new HttpException({ message: 'Book is already rented for this period' }, HttpStatus.CONFLICT);
    }
    return prisma.rental.create({
      data: {
        book_id: bookId,
        start_date: now,
        end_date: oneWeekLater,
      },
      select: { start_date: true, end_date: true },
    });
  }

  async deleteBook(id: string) {
    let bookId: bigint;
    try {
      bookId = BigInt(id);
    } catch {
      throw new HttpException({ message: 'Érvénytelen könyv azonosító' }, HttpStatus.BAD_REQUEST);
    }
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new HttpException({ message: 'Book not found' }, HttpStatus.NOT_FOUND);
    }
    await prisma.rental.deleteMany({ where: { book_id: bookId } });
    await prisma.book.delete({ where: { id: bookId } });
    return { message: 'Book deleted successfully' };
  }
}
