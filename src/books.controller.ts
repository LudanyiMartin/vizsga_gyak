import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }

  @Post()
  async createBook(@Body() body: any) {
    return this.booksService.createBook(body);
  }

  @Post(':id/rent')
  async rentBook(@Param('id') id: string) {
    return this.booksService.rentBook(id);
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: string) {
    return this.booksService.deleteBook(id);
  }
}
