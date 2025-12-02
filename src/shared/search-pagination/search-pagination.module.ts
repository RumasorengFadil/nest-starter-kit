import { Module, Global } from '@nestjs/common';
import { SearchPaginationService } from './search-pagination.service';

@Global()
@Module({
  providers: [SearchPaginationService],
  exports: [SearchPaginationService],
})
export class SearchPaginationModule {}
