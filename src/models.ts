export class Book {
  id: bigint;
  title: string;
  author: string;
  publish_year: number;
  page_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Rental {
  id: number;
  book_id: bigint;
  start_date: Date;
  end_date: Date;
  created_at?: Date;
}
